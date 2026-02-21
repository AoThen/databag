package databag

import (
	"databag/internal/store"
	"errors"
	"sync"
	"time"

	"gorm.io/gorm"
)

// CNFPushSupported for allowing push notifications
const CNFPushSupported = "push_notifications"

// CNFEnableOpenAccess for allowing for public account creation
const CNFEnableOpenAccess = "open_access"

// CNFOpenAccessLimit for limiting number of accounts for public creation
const CNFOpenAccessLimit = "account_limit"

// CNFConfigured set when admin token has been set
const CNFConfigured = "configured"

// CNFToken identifies the admin token
const CNFToken = "token"

// CNFDomain identifies the configured server hostname
const CNFDomain = "domain"

// CNFStorage specifies the storage limit per account
const CNFStorage = "storage"

// CNFAssetPath specifies the path to store assets
const CNFAssetPath = "asset_path"

// CNFScriptPath specifies the path where transform scripts are found
const CNFScriptPath = "script_path"

// CNFAllowUnsealed specified if plantext channels can be created
const CNFAllowUnsealed = "allow_unsealed"

// CNFEnableImage specifies whether node can process image assets
const CNFEnableImage = "enable_image"

// CNFEnableAudio specifies whether node can process audio assets
const CNFEnableAudio = "enable_audio"

// CNFEnableVideo specifies whether node can process video assets
const CNFEnableVideo = "enable_video"

// CNFEnableBinary specifies whether node can attach binary asset
const CNFEnableBinary = "enable_binary"

// CNFKeyType specifies the type of key to use for identity
const CNFKeyType = "key_type"

// CNFEnableIce specifies whether webrtc is enabled
const CNFEnableIce = "enable_ice"

// CNFIceMode specifies if turn service is used
const CNFIceService = "ice_service"

// CNFIceUrl specifies the ice candidate url
const CNFIceUrl = "ice_url"

// CNFIceUrl specifies the ice candidate username
const CNFIceUsername = "ice_username"

// CNFIceUrl specifies the ice candidate url
const CNFIcePassword = "ice_password"

// CNFMFAFailedTime start of mfa failure window
const CNFMFAFailedTime = "mfa_failed_time"

// CNFMFAFailedCount number of failures in window
const CNFMFAFailedCount = "mfa_failed_count"

// CNFMFARequired specified if mfa enabled for admin
const CNFMFAEnabled = "mfa_enabled"

// CNFMFAConfirmed specified if mfa has been confirmed for admin
const CNFMFAConfirmed = "mfa_confirmed"

// CNFMFAAlgorirthm specifies internal mfa alogirhtm to use
const CNFMFAAlgorithm = "mfa_algorithm"

// CNFMFASecret specified the mfa secret
const CNFMFASecret = "mfa_secret"

// CNFAdminSession sepcifies the admin session token
const CNFAdminSession = "admin_session"

// CNFAdminSessionExpiry specifies the admin session expiry timestamp
const CNFAdminSessionExpiry = "admin_session_expiry"

// CNFWebPrivateKey specifies private key for webpush notifications
const CNFWebPrivateKey = "web_private_key"

// CNFWebPublicKey specifies public key for webpush notifications
const CNFWebPublicKey = "web_public_key"

const CNFLoginFailPeriod = "login_fail_period"

const CNFLoginFailCount = "login_fail_count"

const CNFLoginAllowWait = "login_allow_wait"

const CNFPasswordMinLength = "password_min_length"

const CNFPasswordMaxLength = "password_max_length"

const CNFPasswordRequireUpper = "password_require_upper"

const CNFPasswordRequireLower = "password_require_lower"

const CNFPasswordRequireNumber = "password_require_number"

const CNFPasswordRequireSpecial = "password_require_special"

// CNFCleanupEnabled enables automatic data cleanup
const CNFCleanupEnabled = "cleanup_enabled"

// CNFCleanupIntervalHours specifies cleanup interval in hours
const CNFCleanupIntervalHours = "cleanup_interval_hours"

// CNFMessageRetentionDays specifies how long to keep messages
const CNFMessageRetentionDays = "message_retention_days"

// CNFAssetRetentionDays specifies how long to keep assets
const CNFAssetRetentionDays = "asset_retention_days"

// CNFCleanupLastRun tracks last cleanup execution time
const CNFCleanupLastRun = "cleanup_last_run"

// Config cache constants
const configCacheTTL = 5 * time.Minute

// configCacheEntry represents a cached configuration value
type configCacheEntry struct {
	value  interface{}
	expiry time.Time
}

// configCache stores configuration values with expiry
var configCache sync.Map

// Config values that should not be cached (dynamic values)
var noCacheConfigs = map[string]bool{
	CNFAdminSession:       true,
	CNFAdminSessionExpiry: true,
	CNFMFAFailedTime:      true,
	CNFMFAFailedCount:     true,
	CNFToken:              true,
	CNFCleanupLastRun:     true,
}

// getCachedValue retrieves value from cache if not expired
func getCachedValue(configID string) (interface{}, bool) {
	if noCacheConfigs[configID] {
		return nil, false
	}
	if entry, ok := configCache.Load(configID); ok {
		if cacheEntry, ok := entry.(*configCacheEntry); ok {
			if time.Now().Before(cacheEntry.expiry) {
				return cacheEntry.value, true
			}
			configCache.Delete(configID)
		}
	}
	return nil, false
}

// setCachedValue stores value in cache with expiry
func setCachedValue(configID string, value interface{}) {
	if noCacheConfigs[configID] {
		return
	}
	configCache.Store(configID, &configCacheEntry{
		value:  value,
		expiry: time.Now().Add(configCacheTTL),
	})
}

// InvalidateConfigCache removes a specific config from cache
func InvalidateConfigCache(configID string) {
	configCache.Delete(configID)
}

// InvalidateAllConfigCache clears all cached configuration
func InvalidateAllConfigCache() {
	configCache = sync.Map{}
}

func getStrConfigValue(configID string, empty string) string {
	if cached, ok := getCachedValue(configID); ok {
		if strVal, ok := cached.(string); ok {
			return strVal
		}
	}

	var config store.Config
	err := store.DB.Where("config_id = ?", configID).First(&config).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		setCachedValue(configID, empty)
		return empty
	}
	setCachedValue(configID, config.StrValue)
	return config.StrValue
}

func getNumConfigValue(configID string, empty int64) int64 {
	if cached, ok := getCachedValue(configID); ok {
		if numVal, ok := cached.(int64); ok {
			return numVal
		}
	}

	var config store.Config
	err := store.DB.Where("config_id = ?", configID).First(&config).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		setCachedValue(configID, empty)
		return empty
	}
	setCachedValue(configID, config.NumValue)
	return config.NumValue
}

func getBoolConfigValue(configID string, empty bool) bool {
	if cached, ok := getCachedValue(configID); ok {
		if boolVal, ok := cached.(bool); ok {
			return boolVal
		}
	}

	var config store.Config
	err := store.DB.Where("config_id = ?", configID).First(&config).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		setCachedValue(configID, empty)
		return empty
	}
	setCachedValue(configID, config.BoolValue)
	return config.BoolValue
}

func getBinConfigValue(configID string, empty []byte) []byte {
	if cached, ok := getCachedValue(configID); ok {
		if binVal, ok := cached.([]byte); ok {
			return binVal
		}
	}

	var config store.Config
	err := store.DB.Where("config_id = ?", configID).First(&config).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		setCachedValue(configID, empty)
		return empty
	}
	setCachedValue(configID, config.BinValue)
	return config.BinValue
}
