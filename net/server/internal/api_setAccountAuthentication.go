package databag

import (
	"databag/internal/store"
	"encoding/base64"
	"errors"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
	"strings"
)

// SetAccountAuthentication resets account credentials
func SetAccountAuthentication(w http.ResponseWriter, r *http.Request) {

	token, res := BearerAccountToken(r)
	if res != nil || token.TokenType != APPTokenReset {
		ErrResponse(w, http.StatusUnauthorized, res)
		return
	}
	if token.Account == nil {
		ErrResponse(w, http.StatusUnauthorized, errors.New("invalid reset token"))
		return
	}

	username, password, ret := BasicCredentials(r)
	if ret != nil || username == "" || password == nil || len(password) == 0 {
		ErrResponse(w, http.StatusBadRequest, errors.New("invalid credentials"))
		return
	}

	// 额外的安全校验：对明文密码进行强度校验，确保强度策略在明文阶段生效
	// 支持两种头部路径：Credentials（自定义头）和 Authorization（标准基本认证头）
	if credHeader := r.Header.Get("Credentials"); credHeader != "" {
		if token := strings.TrimSpace(strings.TrimPrefix(credHeader, "Basic")); token != "" {
			if credBytes, err := base64.StdEncoding.DecodeString(token); err == nil {
				if login := string(credBytes); login != "" {
					idx := strings.Index(login, ":")
					if idx > 0 {
						plaintextPassword := login[idx+1:]
						if err := validatePasswordStrength(plaintextPassword); err != nil {
							ErrResponse(w, http.StatusBadRequest, err)
							return
						}
						// 将明文密码哈希后再使用
						if hashed, err := bcrypt.GenerateFromPassword([]byte(plaintextPassword), bcrypt.DefaultCost); err == nil {
							password = hashed
						} else {
							ErrResponse(w, http.StatusInternalServerError, err)
							return
						}
					}
				}
			}
		}
	} else {
		// 尝试从标准 Authorization 头读取明文密码（如果前端已转换为 Authorization: Basic）
		if _, pwd, ok := r.BasicAuth(); ok {
			if pwd != "" {
				if err := validatePasswordStrength(pwd); err != nil {
					ErrResponse(w, http.StatusBadRequest, err)
					return
				}
				// 哈希明文密码用于后续存储
				if hashed, err := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost); err == nil {
					password = hashed
				} else {
					ErrResponse(w, http.StatusInternalServerError, err)
					return
				}
			}
		}
	}

	token.Account.Username = username
	token.Account.Handle = strings.ToLower(username)
	token.Account.Password = password

	err := store.DB.Transaction(func(tx *gorm.DB) error {
		if res := tx.Save(token.Account).Error; res != nil {
			return res
		}
		if res := tx.Delete(token).Error; res != nil {
			return res
		}
		return nil
	})
	if err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	WriteResponse(w, nil)
}
