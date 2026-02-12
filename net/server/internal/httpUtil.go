package databag

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"runtime"
	"strings"
)

// WriteResponse serialze and write json body for response
func WriteResponse(w http.ResponseWriter, v interface{}) {
	body, err := json.Marshal(v)
	if err != nil {
		_, file, line, _ := runtime.Caller(1)
		p, _ := os.Getwd()
		log.Printf("%s:%d %s", strings.TrimPrefix(file, p), line, err.Error())
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.Header().Set("Content-Type", "application/json")
		w.Write(body)
	}
}

// ReadResponse read and parse json response body
func ReadResponse(w *httptest.ResponseRecorder, v interface{}) error {
	resp := w.Result()
	if resp.StatusCode != 200 {
		return errors.New("response failed")
	}
	if v == nil {
		return nil
	}
	dec := json.NewDecoder(resp.Body)
	dec.Decode(v)
	return nil
}

// SetBasicAuth sets basic auth in authorization header
func SetBasicAuth(r *http.Request, login string) {
	auth := base64.StdEncoding.EncodeToString([]byte(login))
	r.Header.Add("Authorization", "Basic "+auth)
}

// SetBearerAuth sets bearer auth token in header
func SetBearerAuth(r *http.Request, token string) {
	r.Header.Add("Authorization", "Bearer "+token)
}

// SetCredentials set basic auth in credentials header
func SetCredentials(r *http.Request, login string) {
	auth := base64.StdEncoding.EncodeToString([]byte(login))
	r.Header.Add("Credentials", "Basic "+auth)
}

// ParseRequest read and parse json request body
func ParseRequest(r *http.Request, w http.ResponseWriter, obj interface{}) error {
	r.Body = http.MaxBytesReader(w, r.Body, APPBodyLimit)
	dec := json.NewDecoder(r.Body)
	return dec.Decode(&obj)
}

func isAllowedOrigin(origin string) bool {
	// 1. 严格模式开关: 0=禁用源验证(开发环境), 1=启用(生产环境)
	if strict := os.Getenv("DATABAG_WS_ORIGIN_STRICT"); strict == "0" {
		return true
	}

	// 2. 环境变量白名单（优先于数据库配置）
	if envOrigins := os.Getenv("DATABAG_WS_ALLOWED_ORIGINS"); envOrigins != "" {
		for _, allowed := range strings.Split(envOrigins, ",") {
			if strings.TrimSpace(allowed) == origin {
				return true
			}
		}
		return false
	}

	// 3. 回退到数据库配置
	if origin == "" {
		return false
	}
	allowedOrigin := getStrConfigValue(CNFDomain, "")
	if allowedOrigin == "" {
		return false
	}
	return origin == "https://"+allowedOrigin || origin == "https://www."+allowedOrigin
}
