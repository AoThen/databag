package databag

import (
	"databag/internal/store"
	"fmt"
	"sync"
	"time"

	"gorm.io/gorm"
)

const maxConcurrentGarbageCollects = 5

var garbageCollectSemaphore = make(chan struct{}, maxConcurrentGarbageCollects)
var garbageCollectWG sync.WaitGroup

var cleanupSchedulerSync sync.Mutex

func StartCleanupScheduler() {
	if !getCleanupEnabled() {
		return
	}

	interval := getCleanupIntervalHours()
	if interval <= 0 {
		interval = 168
	}

	go runCleanupScheduler(interval)
}

func runCleanupScheduler(intervalHours int64) {
	ticker := time.NewTicker(time.Duration(intervalHours) * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			executeScheduledCleanup()
		}
	}
}

func executeScheduledCleanup() {
	cleanupSchedulerSync.Lock()
	defer cleanupSchedulerSync.Unlock()

	lastRun := getNumConfigValue(CNFCleanupLastRun, 0)
	now := time.Now().Unix()

	interval := getCleanupIntervalHours() * 3600
	if now-lastRun < interval {
		return
	}

	messageRetention := getMessageRetentionDays()
	if messageRetention <= 0 {
		messageRetention = 90
	}

	assetRetention := getAssetRetentionDays()
	if assetRetention <= 0 {
		assetRetention = 180
	}

	retentionDays := messageRetention
	if assetRetention < retentionDays {
		retentionDays = assetRetention
	}

	response, err := performCleanup(retentionDays, true)
	if err != nil {
		ErrMsg(err)
		return
	}

	setCleanupLastRun(now)

	// 新增：IP封禁清理
	var ipCleanupResult int64
	if getIPBlockCleanupEnabled() {
		ipCleanupResult = cleanupExpiredIPBlocks()
	}

	if response.DeletedTopics > 0 || response.DeletedAssets > 0 || ipCleanupResult > 0 {
		LogMsg(fmt.Sprintf("[Cleanup] 自动清理完成: 删除消息 %d 条, 删除文件 %d 个, 释放空间 %s, 清理过期IP封禁 %d 条",
			response.DeletedTopics, response.DeletedAssets, formatBytes(response.FreedBytes), ipCleanupResult))
	}
}

func setCleanupLastRun(timestamp int64) {
	var config store.Config
	result := store.DB.Where("config_id = ?", CNFCleanupLastRun).First(&config)

	if result.Error != nil && result.Error == gorm.ErrRecordNotFound {
		store.DB.Create(&store.Config{ConfigID: CNFCleanupLastRun, NumValue: timestamp})
	} else {
		store.DB.Model(&config).Update("num_value", timestamp)
	}
}

func performCleanup(retentionDays int64, includeAssets bool) (*CleanupResponse, error) {
	cutoffTime := time.Now().Unix() - (retentionDays * 86400)
	batchSize := 1000
	var response CleanupResponse

	var accounts []store.Account
	if err := store.DB.Find(&accounts).Error; err != nil {
		return nil, err
	}

	response.AffectedAccounts = len(accounts)

	for _, account := range accounts {
		for {
			var topics []store.Topic
			err := store.DB.Where("account_id = ? AND created < ?", account.ID, cutoffTime).
				Limit(batchSize).
				Find(&topics).Error

			if err != nil {
				return nil, err
			}

			if len(topics) == 0 {
				break
			}

			var topicIDs []uint
			for _, topic := range topics {
				topicIDs = append(topicIDs, topic.ID)
			}

			err = store.DB.Transaction(func(tx *gorm.DB) error {
				if includeAssets {
					var assets []store.Asset
					if res := tx.Where("topic_id IN ?", topicIDs).Find(&assets).Error; res != nil {
						return res
					}
					response.DeletedAssets += int64(len(assets))
					response.FreedBytes += calculateAssetSize(assets)

					if res := tx.Where("topic_id IN ?", topicIDs).Delete(&store.Asset{}).Error; res != nil {
						return res
					}
				}

				if res := tx.Where("topic_id IN ?", topicIDs).Delete(&store.Tag{}).Error; res != nil {
					return res
				}

				if res := tx.Where("topic_id IN ?", topicIDs).Delete(&store.TagSlot{}).Error; res != nil {
					return res
				}

				if res := tx.Where("id IN ?", topicIDs).Delete(&store.Topic{}).Error; res != nil {
					return res
				}

				if res := tx.Where("topic_slot_id IN ?", topicIDs).Delete(&store.TopicSlot{}).Error; res != nil {
					return res
				}

				return nil
			})

			if err != nil {
				return nil, err
			}

			response.DeletedTopics += int64(len(topics))

			if len(topics) < batchSize {
				break
			}
		}

		garbageCollectWG.Add(1)
		go func(acc *store.Account) {
			garbageCollectSemaphore <- struct{}{}
			defer func() {
				<-garbageCollectSemaphore
				garbageCollectWG.Done()
			}()
			garbageCollect(acc)
		}(&account)
	}

	garbageCollectWG.Wait()

	cleanupOrphanedAssets(cutoffTime)

	return &response, nil
}

func getIPBlockCleanupEnabled() bool {
	return getBoolConfigValue("DATABAG_IP_BLOCK_CLEANUP_ENABLED", true)
}

func cleanupExpiredIPBlocks() int64 {
	now := time.Now()
	result := store.DB.Where("expires_at < ?", now).Delete(&store.IPBlock{})
	if result.Error != nil {
		LogMsg(fmt.Sprintf("[Cleanup] IP封禁清理失败: %v", result.Error))
		return 0
	}
	if result.RowsAffected > 0 {
		LogMsg(fmt.Sprintf("[Cleanup] 清理过期IP封禁 %d 条", result.RowsAffected))
	}
	return result.RowsAffected
}

func calculateAssetSize(assets []store.Asset) int64 {
	var total int64
	for _, asset := range assets {
		total += asset.Size
	}
	return total
}
