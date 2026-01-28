package databag

import (
	"databag/internal/store"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

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

func RecordIPAuthFailure(ip string) {
	if IsIPWhitelisted(ip) {
		return
	}

	now := time.Now()
	nowUnix := now.Unix()
	failPeriod := getLoginFailPeriod()
	threshold := int(getIPBlockThreshold())
	blockDuration := getIPBlockDuration()
	maxDuration := getIPBlockMaxDuration()

	var block store.IPBlock
	err := store.DB.Where("ip = ?", ip).First(&block).Error

	if err == nil && now.After(block.ExpiresAt) {
		store.DB.Where("ip = ?", ip).Delete(&block)
		LogMsg("[IPBlock] IP " + ip + " expired, record removed")
		err = gorm.ErrRecordNotFound
	}

	// 首次失败或时间窗口已过
	if errors.Is(err, gorm.ErrRecordNotFound) || nowUnix-block.LastFailTime > failPeriod {
		// 时间窗口已过，重置计数
		if nowUnix-block.LastFailTime > failPeriod && !errors.Is(err, gorm.ErrRecordNotFound) {
			LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure window expired, count reset", ip))
		}
		block = store.IPBlock{
			IP:           ip,
			Reason:       "too many authentication failures",
			BlockedAt:    now,
			ExpiresAt:    now.Add(time.Duration(blockDuration) * time.Hour),
			FailCount:    1,
			LastFailTime: nowUnix,
		}
		LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure count: 1/%d", ip, threshold))
		store.DB.Create(&block)
	} else {
		// 时间窗口内，累计失败次数
		block.FailCount++
		block.LastFailTime = nowUnix

		LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure count: %d/%d", ip, block.FailCount, threshold))

		// 计算封禁时长（指数增长）
		duration := blockDuration
		if block.FailCount > 1 {
			for i := 1; i < block.FailCount-1; i++ {
				duration *= 2
			}
		}
		if duration > maxDuration {
			duration = maxDuration
		}
		block.ExpiresAt = now.Add(time.Duration(duration) * time.Hour)
		block.Reason = "blocked: too many auth failures"

		store.DB.Model(&block).Updates(map[string]interface{}{
			"fail_count":     block.FailCount,
			"last_fail_time": block.LastFailTime,
			"blocked_at":     block.BlockedAt,
			"expires_at":     block.ExpiresAt,
			"reason":         block.Reason,
		})

		// 达到阈值，封禁
		if block.FailCount >= threshold {
			LogMsg(fmt.Sprintf("[IPBlock] IP %s blocked for %d hours after %d auth failures (window: %d seconds)",
				ip, duration, block.FailCount, failPeriod))
		}
	}
}

func ResetIPAuthFailure(ip string) {
	result := store.DB.Where("ip = ?", ip).Delete(&store.IPBlock{})
	if result.Error == nil && result.RowsAffected > 0 {
		LogMsg("[IPBlock] IP " + ip + " unblocked")
	}
}

func BlockIP(ip string, reason string, durationHours int) error {
	now := time.Now()
	expiresAt := now.Add(time.Duration(durationHours) * time.Hour)
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
		LogMsg(fmt.Sprintf("[IPBlock] IP %s manually blocked, reason: %s, duration: %d hours", ip, reason, durationHours))
	}
	return err
}

func UnblockIP(ip string) error {
	result := store.DB.Where("ip = ?", ip).Delete(&store.IPBlock{})
	if result.Error == nil && result.RowsAffected > 0 {
		LogMsg("[IPBlock] IP " + ip + " manually unblocked")
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
	}
	return err
}

func RemoveIPFromWhitelist(ip string) error {
	result := store.DB.Where("ip = ?", ip).Delete(&store.IPWhitelist{})
	if result.Error == nil && result.RowsAffected > 0 {
		LogMsg("[IPBlock] IP " + ip + " removed from whitelist")
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
