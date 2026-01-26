package databag

import (
	"databag/internal/store"
	"errors"
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

	var block store.IPBlock
	err := store.DB.Where("ip = ?", ip).First(&block).Error

	now := time.Now()
	threshold := int(getIPBlockThreshold())

	if errors.Is(err, gorm.ErrRecordNotFound) {
		block = store.IPBlock{
			IP:        ip,
			Reason:    "too many authentication failures",
			BlockedAt: now,
			ExpiresAt: now.Add(time.Duration(getIPBlockDuration()) * time.Hour),
			FailCount: 1,
		}
		if block.FailCount >= threshold {
			store.DB.Create(&block)
		}
	} else {
		if now.After(block.ExpiresAt) {
			block.BlockedAt = now
			block.ExpiresAt = now.Add(time.Duration(getIPBlockDuration()) * time.Hour)
			block.FailCount = 1
		} else {
			block.FailCount++
			duration := getIPBlockDuration()
			for i := 1; i < block.FailCount && int64(i) < duration; i++ {
				duration *= 2
			}
			if duration > getIPBlockMaxDuration() {
				duration = getIPBlockMaxDuration()
			}
			block.ExpiresAt = now.Add(time.Duration(duration) * time.Hour)
		}
		if block.FailCount >= threshold {
			store.DB.Model(&block).Updates(map[string]interface{}{
				"blocked_at": block.BlockedAt,
				"expires_at": block.ExpiresAt,
				"fail_count": block.FailCount,
			})
		}
	}
}

func ResetIPAuthFailure(ip string) {
	store.DB.Where("ip = ?", ip).Delete(&store.IPBlock{})
}

func BlockIP(ip string, reason string, durationHours int) error {
	expiresAt := time.Now().Add(time.Duration(durationHours) * time.Hour)
	return store.DB.Model(&store.IPBlock{}).Where("ip = ?", ip).Assign(map[string]interface{}{
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
}

func UnblockIP(ip string) error {
	return store.DB.Where("ip = ?", ip).Delete(&store.IPBlock{}).Error
}

func AddIPToWhitelist(ip string, note string) error {
	return store.DB.Model(&store.IPWhitelist{}).Where("ip = ?", ip).Assign(map[string]interface{}{
		"ip":   ip,
		"note": note,
	}).FirstOrCreate(&store.IPWhitelist{}, store.IPWhitelist{
		IP:   ip,
		Note: note,
	}).Error
}

func RemoveIPFromWhitelist(ip string) error {
	return store.DB.Where("ip = ?", ip).Delete(&store.IPWhitelist{}).Error
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
