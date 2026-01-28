package databag

import (
	"databag/internal/store"
	"encoding/base64"
	"errors"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
	"strings"
	"time"
)

// AccountLogin retrieves account specified by username and password
func AccountLogin(r *http.Request) (*store.Account, error) {

	// extract request auth
	username, password, ok := r.BasicAuth()
	if !ok || username == "" || password == "" {
		return nil, errors.New("invalid login")
	}

	// find account
	account := &store.Account{}
	if store.DB.Model(&store.Account{}).Where("Username = ?", username).First(&account).Error != nil {
		return nil, errors.New("invalid login")
	}

	// check account lockout
	curTime := time.Now().Unix()
	failPeriod := getLoginFailPeriod()
	failCount := getLoginFailCount()
	if account.LoginFailedTime+failPeriod > curTime && account.LoginFailedCount > uint(failCount) {
		return nil, errors.New("account temporarily locked")
	}

	// compare password
	if bcrypt.CompareHashAndPassword(account.Password, []byte(password)) != nil {
		if err := incrementLoginFailure(account.ID); err != nil {
			LogMsg("failed to increment login failure count")
		}

		applyProgressiveDelay(account.LoginFailedCount)

		clientIP := getClientIP(r)

		// 检查IP是否需要立即封禁
		if RecordIPAuthFailure(clientIP) {
			// 立即阻止本次请求
			return nil, errors.New("IP temporarily blocked due to too many failed attempts")
		}

		return nil, errors.New("invalid password")
	}

	// reset login failures on successful login
	if account.LoginFailedCount > 0 {
		if err := resetLoginFailures(account.ID); err != nil {
			LogMsg("failed to reset login failures")
		}
	}

	return account, nil
}

// BearerAccountToken retrieves AccountToken object specified by authorization header
func BearerAccountToken(r *http.Request) (*store.AccountToken, error) {

	// parse bearer authentication
	auth := r.Header.Get("Authorization")
	token := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer"))

	// find token record
	var accountToken store.AccountToken
	if err := store.DB.Preload("Account").Where("token = ?", token).First(&accountToken).Error; err != nil {
		return nil, err
	}
	if accountToken.Expires < time.Now().Unix() {
		return nil, errors.New("expired token")
	}
	return &accountToken, nil
}

// AccessToken retrieves AccountToken specified by token query param
func AccessToken(r *http.Request) (*store.AccountToken, int, error) {

	// parse authentication token
	token := r.FormValue("token")
	if token == "" {
		return nil, http.StatusUnauthorized, errors.New("token not set")
	}

	// find token record
	var accountToken store.AccountToken
	if err := store.DB.Preload("Account").Where("token = ?", token).First(&accountToken).Error; err != nil {
		return nil, http.StatusUnauthorized, err
	}
	if accountToken.Expires < time.Now().Unix() {
		return nil, http.StatusUnauthorized, errors.New("expired token")
	}
	return &accountToken, http.StatusOK, nil
}

// ParamAdminToken compares admin token with token query param
// Supports two types of tokens:
// 1. Static admin token (CNFToken) - for backward compatibility
// 2. Session token (CNFAdminSession) - for service token authentication
func ParamAdminToken(r *http.Request) (int, error) {

	// parse authentication token
	token := r.FormValue("token")
	if token == "" {
		return http.StatusUnauthorized, errors.New("token not set")
	}

	// nothing to do if not configured
	if !getBoolConfigValue(CNFConfigured, false) {
		return http.StatusUnauthorized, errors.New("node not configured")
	}

	// check static admin token (CNFToken)
	staticToken := getStrConfigValue(CNFToken, "")
	if staticToken != "" && staticToken == token {
		return http.StatusOK, nil
	}

	// check session token (CNFAdminSession)
	sessionToken := getStrConfigValue(CNFAdminSession, "")
	if sessionToken != "" && sessionToken == token {
		return http.StatusOK, nil
	}

	// token is invalid
	clientIP := getClientIP(r)
	RecordIPAuthFailure(clientIP)
	return http.StatusUnauthorized, errors.New("invalid admin token")
}

// ParamSessionToken compares session token with token query param
func ParamSessionToken(r *http.Request) (int, error) {

	// parse authentication token
	token := r.FormValue("token")
	if token == "" {
		return http.StatusUnauthorized, errors.New("token not set")
	}

	// nothing to do if not configured
	if !getBoolConfigValue(CNFConfigured, false) {
		return http.StatusUnauthorized, errors.New("node not configured")
	}

	// compare password
	value := getStrConfigValue(CNFAdminSession, "")
	if value != token {
		return http.StatusUnauthorized, errors.New("invalid session token")
	}

	return http.StatusOK, nil
}

// GetSessionDetail retrieves account detail specified by agent query param
func GetSessionDetail(r *http.Request) (*store.Session, int, error) {

	// parse authentication token
	target, access, err := ParseToken(r.FormValue("agent"))
	if err != nil {
		return nil, http.StatusBadRequest, err
	}

	// find session record
	var session store.Session
	if err := store.DB.Preload("Account.AccountDetail").Where("account_id = ? AND token = ?", target, access).Find(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, http.StatusNotFound, err
		}
		return nil, http.StatusInternalServerError, err
	}

	if session.Account.Disabled {
		return nil, http.StatusGone, errors.New("account is inactive")
	}

	return &session, http.StatusOK, nil
}

// GetSession retrieves account specified by agent query param
func GetSession(r *http.Request) (*store.Session, int, error) {

	// parse authentication token
	target, access, err := ParseToken(r.FormValue("agent"))
	if err != nil {
		return nil, http.StatusBadRequest, err
	}

	// find session record
	var session store.Session
	if err := store.DB.Preload("Account").Where("account_id = ? AND token = ?", target, access).Find(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, http.StatusNotFound, err
		}
		return nil, http.StatusInternalServerError, err
	}

	if session.Account.Disabled {
		return nil, http.StatusGone, errors.New("account is inactive")
	}

	return &session, http.StatusOK, nil
}

// ParamAgentToken retrieves account specified by agent query param
func ParamAgentToken(r *http.Request, detail bool) (*store.Account, int, error) {

	// parse authentication token
	target, access, err := ParseToken(r.FormValue("agent"))
	if err != nil {
		return nil, http.StatusBadRequest, err
	}

	// find session record
	var session store.Session
	if detail {
		if err := store.DB.Preload("Account.AccountDetail").Where("account_id = ? AND token =?", target, access).Find(&session).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	} else {
		if err := store.DB.Preload("Account").Where("account_id = ? AND token =?", target, access).Find(&session).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	}

	if session.Account.Disabled {
		return nil, http.StatusGone, errors.New("account is inactive")
	}

	return &session.Account, http.StatusOK, nil
}

// BearerAppToken retrieves account specified by authorization header
func BearerAppToken(r *http.Request, detail bool) (*store.Account, int, error) {

	// parse bearer authentication
	auth := r.Header.Get("Authorization")
	token := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer"))
	target, access, err := ParseToken(token)
	if err != nil {
		return nil, http.StatusBadRequest, err
	}

	// find token record
	var app store.App
	if detail {
		if err := store.DB.Preload("Account.AccountDetail").Where("account_id = ? AND token = ?", target, access).First(&app).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	} else {
		if err := store.DB.Preload("Account").Where("account_id = ? AND token = ?", target, access).First(&app).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	}
	if app.Account.Disabled {
		return nil, http.StatusGone, errors.New("account is inactive")
	}

	return &app.Account, http.StatusOK, nil
}

// ParseToken separates access token into its guid and random value parts
func ParseToken(token string) (string, string, error) {

	split := strings.Split(token, ".")
	if len(split) != 2 {
		return "", "", errors.New("invalid token format")
	}
	return split[0], split[1], nil
}

// ParamTokenType returns type of access token specified
func ParamTokenType(r *http.Request) string {
	if r.FormValue(APPTokenContact) != "" {
		return APPTokenContact
	}
	if r.FormValue(APPTokenAgent) != "" {
		return APPTokenAgent
	}
	if r.FormValue(APPTokenAttach) != "" {
		return APPTokenAttach
	}
	if r.FormValue(APPTokenCreate) != "" {
		return APPTokenCreate
	}
	if r.FormValue(APPTokenReset) != "" {
		return APPTokenReset
	}
	return ""
}

// ParamContactToken retrieves card specified by contact query param
func ParamContactToken(r *http.Request, detail bool) (*store.Card, int, error) {

	// parse authentication token
	target, access, err := ParseToken(r.FormValue("contact"))
	if err != nil {
		return nil, http.StatusBadRequest, err
	}

	// find token record
	var card store.Card
	if detail {
		if err := store.DB.Preload("CardSlot").Preload("Account.AccountDetail").Where("account_id = ? AND in_token = ?", target, access).First(&card).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	} else {
		if err := store.DB.Preload("CardSlot").Preload("Account").Where("account_id = ? AND in_token = ?", target, access).First(&card).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	}
	if card.Account.Disabled {
		return nil, http.StatusGone, errors.New("account is inactive")
	}
	if card.Status != APPCardConnecting && card.Status != APPCardConnected {
		return nil, http.StatusUnauthorized, errors.New("invalid connection state")
	}

	return &card, http.StatusOK, nil
}

// BearerContactToken retrieves card specified by authorization header
func BearerContactToken(r *http.Request, detail bool) (*store.Card, int, error) {

	// parse bearer authentication
	auth := r.Header.Get("Authorization")
	token := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer"))
	target, access, err := ParseToken(token)
	if err != nil {
		return nil, http.StatusBadRequest, err
	}

	// find token record
	var card store.Card
	if detail {
		if err := store.DB.Preload("Account.AccountDetail").Where("account_id = ? AND in_token = ?", target, access).First(&card).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	} else {
		if err := store.DB.Preload("Account").Where("account_id = ? AND in_token = ?", target, access).First(&card).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, http.StatusNotFound, err
			}
			return nil, http.StatusInternalServerError, err
		}
	}
	if card.Account.Disabled {
		return nil, http.StatusGone, errors.New("account is inactive")
	}
	if card.Status != APPCardConnecting && card.Status != APPCardConnected {
		return nil, http.StatusUnauthorized, errors.New("invalid connection state")
	}

	return &card, http.StatusOK, nil
}

// BasicCredentials extracts username and password set it credentials header
func BasicCredentials(r *http.Request) (string, []byte, error) {

	var username string
	var password []byte

	// parse bearer authentication
	auth := r.Header.Get("Credentials")
	token := strings.TrimSpace(strings.TrimPrefix(auth, "Basic"))

	// decode basic auth
	credentials, err := base64.StdEncoding.DecodeString(token)
	if err != nil {
		return username, password, err
	}

	login := string(credentials)
	idx := strings.Index(login, ":")
	if idx <= 0 {
		return username, password, errors.New("invalid credentials")
	}

	// hash password
	username = login[0:idx]
	password, err = bcrypt.GenerateFromPassword([]byte(login[idx+1:]), bcrypt.DefaultCost)
	if err != nil {
		return username, password, err
	}

	return username, password, nil
}

func incrementLoginFailure(accountID uint) error {
	curTime := time.Now().Unix()
	failPeriod := getLoginFailPeriod()

	return store.DB.Transaction(func(tx *gorm.DB) error {
		var account store.Account
		if err := tx.First(&account, accountID).Error; err != nil {
			return err
		}

		if account.LoginFailedTime+failPeriod > curTime {
			account.LoginFailedCount += 1
		} else {
			account.LoginFailedTime = curTime
			account.LoginFailedCount = 1
		}

		return tx.Model(&account).Updates(map[string]interface{}{
			"login_failed_time":  account.LoginFailedTime,
			"login_failed_count": account.LoginFailedCount,
		}).Error
	})
}

func resetLoginFailures(accountID uint) error {
	return store.DB.Model(&store.Account{}).Where("id = ?", accountID).Updates(map[string]interface{}{
		"login_failed_time":  0,
		"login_failed_count": 0,
	}).Error
}

func applyProgressiveDelay(failureCount uint) {
	baseDelay := getLoginAllowWait()
	exponentialDelay := int64(1) << failureCount
	if exponentialDelay > 8 {
		exponentialDelay = 8
	}

	delaySeconds := baseDelay * exponentialDelay
	if delaySeconds > 30 {
		delaySeconds = 30
	}

	time.Sleep(time.Duration(delaySeconds) * time.Second)
}

func getClientIP(r *http.Request) string {
	clientIP := r.RemoteAddr
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		clientIP = strings.Split(forwarded, ",")[0]
	}
	return strings.TrimSpace(clientIP)
}
