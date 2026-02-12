package databag

import (
	"os"
	"strconv"
)

func getLoginIntConfig(envKey string, defaultValue int64) int64 {
	if value := os.Getenv(envKey); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getLoginBoolConfig(envKey string, defaultValue bool) bool {
	if value := os.Getenv(envKey); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getLoginFailPeriod() int64 {
	return getLoginIntConfig("DATABAG_LOGIN_FAIL_PERIOD", APPLoginFailPeriod)
}

func getLoginFailCount() int64 {
	return getLoginIntConfig("DATABAG_LOGIN_FAIL_COUNT", APPLoginFailCount)
}

func getLoginAllowWait() int64 {
	return getLoginIntConfig("DATABAG_LOGIN_ALLOW_WAIT", APPLoginAllowWait)
}

func getPasswordMinLength() int {
	return int(getLoginIntConfig("DATABAG_PASSWORD_MIN_LENGTH", APPPasswordMinLength))
}

func getPasswordMaxLength() int {
	return int(getLoginIntConfig("DATABAG_PASSWORD_MAX_LENGTH", APPPasswordMaxLength))
}

func getPasswordRequireUpper() bool {
	return getLoginBoolConfig("DATABAG_PASSWORD_REQUIRE_UPPER", APPPasswordRequireUpper)
}

func getPasswordRequireLower() bool {
	return getLoginBoolConfig("DATABAG_PASSWORD_REQUIRE_LOWER", APPPasswordRequireLower)
}

func getPasswordRequireNumber() bool {
	return getLoginBoolConfig("DATABAG_PASSWORD_REQUIRE_NUMBER", APPPasswordRequireNumber)
}

func getPasswordRequireSpecial() bool {
	return getLoginBoolConfig("DATABAG_PASSWORD_REQUIRE_SPECIAL", APPPasswordRequireSpecial)
}

func getIPBlockBaseDuration() int64 {
	return getLoginIntConfig("DATABAG_IP_BLOCK_BASE_DURATION", APPIPBlockDuration)
}

func getIPBlockThreshold() int64 {
	return getLoginIntConfig("DATABAG_IP_BLOCK_THRESHOLD", APPIPBlockThreshold)
}

func getIPBlockMaxDuration() int64 {
	return getLoginIntConfig("DATABAG_IP_BLOCK_MAX_DURATION", APPIPBlockMaxDuration)
}

func getCleanupEnabled() bool {
	return getLoginBoolConfig("DATABAG_CLEANUP_ENABLED", false)
}

func getCleanupIntervalHours() int64 {
	return getLoginIntConfig("DATABAG_CLEANUP_INTERVAL_HOURS", 24)
}

func getMessageRetentionDays() int64 {
	return getLoginIntConfig("DATABAG_MESSAGE_RETENTION_DAYS", 90)
}

func getAssetRetentionDays() int64 {
	return getLoginIntConfig("DATABAG_ASSET_RETENTION_DAYS", 180)
}
