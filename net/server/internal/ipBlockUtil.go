package databag

import (
	"databag/internal/store"
	"errors"
	"fmt"
	"sync"
	"time"

	"gorm.io/gorm"
)

// IP缓存条目
type IPCacheEntry struct {
	IsBlocked     bool
	IsWhitelisted bool
	ExpiresAt     time.Time
	LastChecked   time.Time
}

// IP缓存相关变量
var (
	ipCache              = sync.Map{}
	cacheCleanupInterval = 5 * time.Minute
	cacheExpiration      = 1 * time.Minute
)

// 初始化缓存清理协程
func init() {
	go func() {
		ticker := time.NewTicker(cacheCleanupInterval)
		defer ticker.Stop()

		for range ticker.C {
			now := time.Now()
			ipCache.Range(func(key, value interface{}) bool {
				if entry, ok := value.(*IPCacheEntry); ok {
					if now.After(entry.LastChecked.Add(cacheExpiration)) {
						ipCache.Delete(key)
					}
				}
				return true
			})
		}
	}()
}

// 正确的指数增长计算
func calculateBlockDuration(failCount int, baseDuration, maxDuration int64) int64 {
	if failCount <= 1 {
		return baseDuration
	}

	// 正确的指数增长: baseDuration * 2^(failCount-1)
	duration := baseDuration
	for i := 1; i < failCount; i++ {
		duration *= 2
		if duration > maxDuration {
			return maxDuration
		}
	}

	return duration
}

// 统一的IP状态检查
func CheckIPStatus(ip string) (isWhitelisted bool, isBlocked bool) {
	// 先检查缓存
	if entry, ok := ipCache.Load(ip); ok {
		if cacheEntry, ok := entry.(*IPCacheEntry); ok {
			if time.Now().Before(cacheEntry.LastChecked.Add(cacheExpiration)) {
				return cacheEntry.IsWhitelisted, cacheEntry.IsBlocked
			}
		}
	}

	// 缓存未命中，查询数据库
	isWhitelisted = IsIPWhitelisted(ip)
	isBlocked = IsIPBlocked(ip)

	// 更新缓存
	var expiresAt time.Time
	if isBlocked {
		var block store.IPBlock
		err := store.DB.Where("ip = ?", ip).First(&block).Error
		if err == nil {
			expiresAt = block.ExpiresAt
		} else {
			expiresAt = time.Now().Add(cacheExpiration)
		}
	} else {
		expiresAt = time.Now().Add(cacheExpiration)
	}

	ipCache.Store(ip, &IPCacheEntry{
		IsBlocked:     isBlocked,
		IsWhitelisted: isWhitelisted,
		ExpiresAt:     expiresAt,
		LastChecked:   time.Now(),
	})

	return isWhitelisted, isBlocked
}

func IsIPBlocked(ip string) bool {
	var block store.IPBlock
	err := store.DB.Where("ip = ?", ip).First(&block).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false
	}
	if time.Now().After(block.ExpiresAt) {
		store.DB.Where("ip = ?", ip).Delete(&block)
		LogMsg("[IPBlock] IP " + ip + " block expired, removed")
		return false
	}
	return true
}

func IsIPWhitelisted(ip string) bool {
	var whitelist store.IPWhitelist
	err := store.DB.Where("ip = ?", ip).First(&whitelist).Error
	return !errors.Is(err, gorm.ErrRecordNotFound)
}

func RecordIPAuthFailure(ip string) bool {
	if IsIPWhitelisted(ip) {
		return false
	}

	now := time.Now()
	nowUnix := now.Unix()
	failPeriod := getLoginFailPeriod()
	threshold := int(getIPBlockThreshold())
	baseDuration := getIPBlockBaseDuration()
	maxDuration := getIPBlockMaxDuration()

	var block store.IPBlock
	err := store.DB.Where("ip = ?", ip).First(&block).Error

	if err == nil && now.After(block.ExpiresAt) {
		store.DB.Where("ip = ?", ip).Delete(&block)
		LogMsg("[IPBlock] IP " + ip + " expired, record removed")
		err = gorm.ErrRecordNotFound
	}

	// 修复时间窗口逻辑：首次失败或时间窗口已过
	windowExpired := errors.Is(err, gorm.ErrRecordNotFound) ||
		(err == nil && (nowUnix-block.LastFailTime) > failPeriod)

	if windowExpired {
		// 时间窗口已过，重置计数
		if err == nil {
			LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure window expired, count reset", ip))
		}

		block = store.IPBlock{
			IP:           ip,
			Reason:       "authentication failures",
			BlockedAt:    now,
			ExpiresAt:    now.Add(time.Duration(baseDuration) * time.Hour),
			FailCount:    1,
			LastFailTime: nowUnix, // 正确设置首次失败时间
		}
		LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure count: 1/%d", ip, threshold))
		store.DB.Create(&block)
		return false
	} else {
		// 时间窗口内，累计失败次数
		block.FailCount++
		block.LastFailTime = nowUnix
		LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure count: %d/%d", ip, block.FailCount, threshold))

		// 使用修正的指数增长算法
		duration := calculateBlockDuration(block.FailCount, baseDuration, maxDuration)
		block.ExpiresAt = now.Add(time.Duration(duration) * time.Hour)
		block.Reason = "blocked: too many auth failures"

		store.DB.Model(&block).Updates(map[string]interface{}{
			"fail_count":     block.FailCount,
			"last_fail_time": block.LastFailTime,
			"blocked_at":     block.BlockedAt,
			"expires_at":     block.ExpiresAt,
			"reason":         block.Reason,
		})

		// 达到阈值，立即封禁并返回true
		if block.FailCount >= threshold {
			LogMsg(fmt.Sprintf("[IPBlock] IP %s blocked for %d hours after %d auth failures (window: %d seconds)",
				ip, duration, block.FailCount, failPeriod))

			// 清除缓存以确保立即生效
			ipCache.Delete(ip)
			return true // 立即生效
		}
		return false
	}
}

func ResetIPAuthFailure(ip string) {
	result := store.DB.Where("ip = ?", ip).Delete(&store.IPBlock{})
	if result.Error == nil && result.RowsAffected > 0 {
		LogMsg("[IPBlock] IP " + ip + " unblocked")
		// 清除缓存以确保立即生效
		ipCache.Delete(ip)
	}
}

// ClearIPCache 手动清理指定IP的缓存
func ClearIPCache(ip string) {
	ipCache.Delete(ip)
	LogMsg("[IPBlock] IP " + ip + " cache cleared")
}

// ClearAllIPCache 清理所有IP缓存
func ClearAllIPCache() {
	ipCache.Range(func(key, value interface{}) bool {
		ipCache.Delete(key)
		return true
	})
	LogMsg("[IPBlock] All IP cache cleared")
}

func BlockIP(ip string, reason string, durationHours int) error {
	now := time.Now()
	var expiresAt time.Time

	if durationHours == 0 {
		// 永久封禁：设置到2099年
		expiresAt = time.Date(2099, 12, 31, 23, 59, 59, 0, time.UTC)
	} else {
		expiresAt = now.Add(time.Duration(durationHours) * time.Hour)
	}

	// 验证最大时长限制
	maxDuration := getIPBlockMaxDuration()
	if durationHours > 0 && int64(durationHours) > maxDuration {
		return fmt.Errorf("封禁时长 %d 小时超过最大限制 %d 小时", durationHours, maxDuration)
	}

	err := store.DB.Model(&store.IPBlock{}).Where("ip = ?", ip).Assign(map[string]interface{}{
		"ip":             ip,
		"reason":         reason,
		"blocked_at":     now,
		"expires_at":     expiresAt,
		"fail_count":     0,
		"last_fail_time": now.Unix(),
	}).FirstOrCreate(&store.IPBlock{}, store.IPBlock{
		IP:           ip,
		Reason:       reason,
		BlockedAt:    now,
		ExpiresAt:    expiresAt,
		FailCount:    0,
		LastFailTime: now.Unix(),
	}).Error
	if err == nil {
		if durationHours == 0 {
			LogMsg(fmt.Sprintf("[IPBlock] IP %s manually blocked permanently, reason: %s", ip, reason))
		} else {
			LogMsg(fmt.Sprintf("[IPBlock] IP %s manually blocked, reason: %s, duration: %d hours", ip, reason, durationHours))
		}
		// 清除缓存以确保立即生效
		ipCache.Delete(ip)
	}
	return err
}

func UnblockIP(ip string) error {
	result := store.DB.Where("ip = ?", ip).Delete(&store.IPBlock{})
	if result.Error == nil && result.RowsAffected > 0 {
		LogMsg("[IPBlock] IP " + ip + " manually unblocked")
		// 清除缓存以确保立即生效
		ipCache.Delete(ip)
	}
	return result.Error
}

func AddIPToWhitelist(ip string, note string) error {
	err := store.DB.Model(&store.IPWhitelist{}).Where("ip = ?", ip).Assign(map[string]interface{}{
		"ip":   ip,
		"note": note,
	}).FirstOrCreate(&store.IPWhitelist{}, store.IPWhitelist{
		IP:   ip,
		Note: note,
	}).Error
	if err == nil {
		LogMsg(fmt.Sprintf("[IPBlock] IP %s added to whitelist, note: %s", ip, note))
		// 清除缓存以确保立即生效
		ipCache.Delete(ip)
	}
	return err
}

func RemoveIPFromWhitelist(ip string) error {
	result := store.DB.Where("ip = ?", ip).Delete(&store.IPWhitelist{})
	if result.Error == nil && result.RowsAffected > 0 {
		LogMsg("[IPBlock] IP " + ip + " removed from whitelist")
		// 清除缓存以确保立即生效
		ipCache.Delete(ip)
	}
	return result.Error
}

func GetIPBlocksFromDB() ([]store.IPBlock, error) {
	var blocks []store.IPBlock
	err := store.DB.Order("blocked_at DESC").Find(&blocks).Error
	return blocks, err
}

func GetIPWhitelistFromDB() ([]store.IPWhitelist, error) {
	var whitelist []store.IPWhitelist
	err := store.DB.Order("created_at DESC").Find(&whitelist).Error
	return whitelist, err
}
