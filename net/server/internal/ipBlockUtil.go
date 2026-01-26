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
	threshold := int(getIPBlockThreshold())

	var block store.IPBlock
	err := store.DB.Where("ip = ?", ip).First(&block).Error

	// 首次失败或已过期，重置计数
	if errors.Is(err, gorm.ErrRecordNotFound) || now.After(block.ExpiresAt) {
		block = store.IPBlock{
			IP:        ip,
			Reason:    "too many authentication failures",
			BlockedAt: now,
			ExpiresAt: now.Add(time.Duration(getIPBlockDuration()) * time.Hour),
			FailCount: 1,
		}
		LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure count: 1/%d", ip, threshold))

		// 未达到阈值时只记录内存计数，不创建数据库记录
		if block.FailCount >= threshold {
			store.DB.Create(&block)
			LogMsg(fmt.Sprintf("[IPBlock] IP %s blocked after %d auth failures", ip, block.FailCount))
		}
	} else {
		// 累计失败次数
		block.FailCount++

		LogMsg(fmt.Sprintf("[IPBlock] IP %s auth failure count: %d/%d", ip, block.FailCount, threshold))

		// 计算新的封禁时长（指数增长）
		duration := getIPBlockDuration()
		for i := 1; i < block.FailCount && int64(i) < duration; i++ {
			duration *= 2
		}
		if duration > getIPBlockMaxDuration() {
			duration = getIPBlockMaxDuration()
		}
		block.ExpiresAt = now.Add(time.Duration(duration) * time.Hour)

		store.DB.Model(&block).Updates(map[string]interface{}{
			"fail_count": block.FailCount,
			"expires_at": block.ExpiresAt,
		})

		// 如果达到阈值，更新Reason为已封禁
		if block.FailCount >= threshold {
			store.DB.Model(&block).Update("reason", "blocked: too many auth failures")
			LogMsg(fmt.Sprintf("[IPBlock] IP %s blocked after %d auth failures", ip, block.FailCount))
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
	expiresAt := time.Now().Add(time.Duration(durationHours) * time.Hour)
	err := store.DB.Model(&store.IPBlock{}).Where("ip = ?", ip).Assign(map[string]interface{}{
		"ip":         ip,
		"reason":     reason,
		"blocked_at": time.Now(),
		"expires_at": expiresAt,
		"fail_count": 0,
	}).FirstOrCreate(&store.IPBlock{}, store.IPBlock{
		IP:        ip,
		Reason:    reason,
		BlockedAt: time.Now(),
		ExpiresAt: expiresAt,
		FailCount: 0,
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
