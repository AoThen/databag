package main

import (
	app "databag/internal"
	"databag/internal/store"
	"errors"
	"fmt"
	webpush "github.com/SherClockHolmes/webpush-go"
	"github.com/gorilla/handlers"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// rateLimitEntry tracks request counts for rate limiting
type rateLimitEntry struct {
	count     int
	resetTime time.Time
}

var (
	rateLimitStore sync.Map
)

func rateLimiter(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// skip rate limiting for WebSocket connections
		if r.Header.Get("Upgrade") == "websocket" {
			h.ServeHTTP(w, r)
			return
		}

		// get client IP
		clientIP := r.RemoteAddr
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			clientIP = strings.Split(forwarded, ",")[0]
		}
		clientIP = strings.TrimSpace(clientIP)

		// 检查IP状态
		isWhitelisted, isBlocked := app.CheckIPStatus(clientIP)

		// 白名单优先
		if isWhitelisted {
			h.ServeHTTP(w, r)
			return
		}

		// 检查IP是否被封禁
		if isBlocked {
			http.Error(w, "access denied", http.StatusForbidden)
			return
		}

		now := time.Now()

		// get or create rate limit entry
		entry, _ := rateLimitStore.LoadOrStore(clientIP, &rateLimitEntry{
			count:     0,
			resetTime: now.Add(time.Minute),
		})
		rateEntry := entry.(*rateLimitEntry)

		// reset if window expired
		if now.After(rateEntry.resetTime) {
			rateEntry.count = 0
			rateEntry.resetTime = now.Add(time.Minute)
		}

		// check rate limit (100 requests per minute by default)
		rateEntry.count++
		if rateEntry.count > 100 {
			w.Header().Set("Retry-After", fmt.Sprintf("%d", int(time.Until(rateEntry.resetTime).Seconds())))
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		h.ServeHTTP(w, r)
	})
}

func main() {
	var cert string
	var key string
	var transformPath string

	port := ":443"
	storePath := "/var/lib/databag"
	webApp := "/opt/databag/"

	args := os.Args[1:]
	for i := 0; i+1 < len(args); i += 2 {
		if args[i] == "-s" {
			storePath = args[i+1]
		} else if args[i] == "-w" {
			webApp = args[i+1]
		} else if args[i] == "-p" {
			port = ":" + args[i+1]
		} else if args[i] == "-c" {
			cert = args[i+1]
		} else if args[i] == "-k" {
			key = args[i+1]
		} else if args[i] == "-t" {
			transformPath = args[i+1]
		}
	}

	store.SetPath(storePath, transformPath)

	// security headers middleware
	securityHeaders := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("X-Frame-Options", "DENY")
			w.Header().Set("X-XSS-Protection", "1; mode=block")
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
			w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
			h.ServeHTTP(w, r)
		})
	}

	// setup vapid keys
	var config store.Config
	err := store.DB.Where("config_id = ?", app.CNFWebPrivateKey).First(&config).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		privateKey, publicKey, err := webpush.GenerateVAPIDKeys()
		if err != nil {
			log.Fatal(err)
		} else {
			err = store.DB.Transaction(func(tx *gorm.DB) error {
				if res := tx.Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "config_id"}},
					DoUpdates: clause.AssignmentColumns([]string{"str_value"}),
				}).Create(&store.Config{ConfigID: app.CNFWebPublicKey, StrValue: publicKey}).Error; res != nil {
					return res
				}
				return nil
			})
			if err != nil {
				log.Fatal(err)
			}
			err = store.DB.Transaction(func(tx *gorm.DB) error {
				if res := tx.Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "config_id"}},
					DoUpdates: clause.AssignmentColumns([]string{"str_value"}),
				}).Create(&store.Config{ConfigID: app.CNFWebPrivateKey, StrValue: privateKey}).Error; res != nil {
					return res
				}
				return nil
			})
			if err != nil {
				log.Fatal(err)
			}
		}
	}

	router := app.NewRouter(webApp)

	// start automatic cleanup scheduler if enabled
	app.StartCleanupScheduler()

	// wrap router with rate limiting, security headers, then CORS
	wrappedRouter := rateLimiter(securityHeaders(router))

	// CORS configuration - restrict allowed origins for security
	allowedOrigins := []string{"*"}
	if envOrigins := os.Getenv("DATABAG_ALLOWED_ORIGINS"); envOrigins != "" {
		allowedOrigins = []string{}
		for _, origin := range strings.Split(envOrigins, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowedOrigins = append(allowedOrigins, origin)
			}
		}
	}
	origins := handlers.AllowedOrigins(allowedOrigins)
	headers := handlers.AllowedHeaders([]string{"content-type", "authorization", "credentials"})
	methods := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"})

	if cert != "" && key != "" {
		log.Printf("using args:" + " -s " + storePath + " -w " + webApp + " -p " + port[1:] + " -c " + cert + " -k " + key + " -t " + transformPath)
		log.Fatal(http.ListenAndServeTLS(port, cert, key, handlers.CORS(origins, headers, methods)(wrappedRouter)))
	} else {
		log.Printf("using args:" + " -s " + storePath + " -w " + webApp + " -p " + port[1:] + " -t " + transformPath)
		log.Fatal(http.ListenAndServe(port, handlers.CORS(origins, headers, methods)(wrappedRouter)))
	}
}
