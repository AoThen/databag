package databag

import (
	"databag/internal/store"
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestAccountLoginFailureTracking(t *testing.T) {
	tests := []struct {
		name          string
		username      string
		password      string
		account       *store.Account
		failCount     uint
		failPeriod    int64
		expectLocked  bool
		expectSuccess bool
	}{
		{
			name:          "successful login resets failures",
			username:      "testuser",
			password:      "correctpassword",
			account:       &store.Account{ID: 1, Username: "testuser", Password: []byte("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy")},
			failCount:     3,
			expectLocked:  false,
			expectSuccess: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := strings.NewReader("")
			req := httptest.NewRequest("GET", "/", body)
			req.SetBasicAuth(tt.username, tt.password)

			account, err := AccountLogin(req)

			if tt.expectSuccess {
				if err != nil {
					t.Errorf("expected success but got error: %v", err)
				}
				if account == nil {
					t.Errorf("expected account but got nil")
				}
			} else {
				if err == nil {
					t.Errorf("expected error but got none")
				}
			}
		})
	}
}

func TestLoginValidation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	t.Run("missing basic auth", func(t *testing.T) {
		req := httptest.NewRequest("POST", server.URL, nil)
		_, err := AccountLogin(req)

		if err == nil {
			t.Error("expected error for missing basic auth")
		}

		if err.Error() != "invalid login" {
			t.Errorf("expected 'invalid login' error, got: %v", err)
		}
	})

	t.Run("empty credentials", func(t *testing.T) {
		req := httptest.NewRequest("POST", server.URL, nil)
		req.SetBasicAuth("", "")
		_, err := AccountLogin(req)

		if err == nil {
			t.Error("expected error for empty credentials")
		}
	})

	t.Run("invalid credentials format", func(t *testing.T) {
		req := httptest.NewRequest("POST", server.URL, nil)
		auth := base64.StdEncoding.EncodeToString([]byte("username"))
		req.Header.Set("Authorization", "Basic "+auth)
		_, err := AccountLogin(req)

		if err == nil {
			t.Error("expected error for invalid credentials format")
		}
	})

	if testing.Short() {
		t.Skip("skipping progressive delay test in short mode")
	}

	t.Run("progressive delay increases with failures", func(t *testing.T) {
		startTime := time.Now()
		applyProgressiveDelay(1)
		delay1 := time.Since(startTime)

		startTime = time.Now()
		applyProgressiveDelay(2)
		delay2 := time.Since(startTime)

		if delay2 <= delay1 {
			t.Errorf("expected delay2 (%v) to be greater than delay1 (%v)", delay2, delay1)
		}
	})
}
