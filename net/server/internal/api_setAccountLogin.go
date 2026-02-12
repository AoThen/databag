package databag

import (
	"databag/internal/store"
	"encoding/base64"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
	"strings"
)

// SetAccountLogin resets account login with agent token
func SetAccountLogin(w http.ResponseWriter, r *http.Request) {

	account, code, err := ParamAgentToken(r, true)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}

	username, password, ret := BasicCredentials(r)
	if ret != nil {
		ErrResponse(w, http.StatusUnauthorized, ret)
		return
	}

	// 额外：支持通过 Authorization Basic 头传输明文密码以进行强度检查
	if authHeader := r.Header.Get("Authorization"); authHeader != "" && strings.HasPrefix(authHeader, "Basic ") {
		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Basic"))
		if credBytes, err := base64.StdEncoding.DecodeString(token); err == nil {
			login := string(credBytes)
			idx := strings.Index(login, ":")
			if idx > 0 {
				plaintext := login[idx+1:]
				if err := validatePasswordStrength(plaintext); err != nil {
					ErrResponse(w, http.StatusBadRequest, err)
					return
				}
				if hashed, err := bcrypt.GenerateFromPassword([]byte(plaintext), bcrypt.DefaultCost); err == nil {
					password = hashed
				} else {
					ErrResponse(w, http.StatusInternalServerError, err)
					return
				}
			}
		}
	}

	if err := validatePasswordStrength(string(password)); err != nil {
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	err = store.DB.Transaction(func(tx *gorm.DB) error {
		if res := tx.Model(&account).Update("account_revision", account.AccountRevision+1).Error; res != nil {
			return res
		}
		if res := tx.Model(&account).Update("profile_revision", account.AccountRevision+1).Error; res != nil {
			return res
		}
		if res := tx.Model(&account).Update("Username", username).Error; res != nil {
			return res
		}
		if res := tx.Model(&account).Update("Handle", strings.ToLower(username)).Error; res != nil {
			return res
		}
		if res := tx.Model(&account).Update("Password", password).Error; res != nil {
			return res
		}
		return nil
	})
	if err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	SetProfileNotification(account)
	SetStatus(account)
	WriteResponse(w, nil)
}
