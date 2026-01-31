package databag

import (
	"databag/internal/store"
	"errors"
	"fmt"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"time"
)

type CleanupRequest struct {
	RetentionDays int64 `json:"retentionDays"`
	IncludeAssets bool  `json:"includeAssets"`
	DryRun        bool  `json:"dryRun"`
	AccountID     *uint `json:"accountID,omitempty"`
}

type CleanupResponse struct {
	DeletedTopics    int64 `json:"deletedTopics"`
	DeletedAssets    int64 `json:"deletedAssets"`
	DeletedChannels  int64 `json:"deletedChannels"`
	DeletedTags      int64 `json:"deletedTags"`
	FreedBytes       int64 `json:"freedBytes"`
	AffectedAccounts int   `json:"affectedAccounts"`
	ProcessingTime   int64 `json:"processingTime"`
	IPBlocksDeleted  int64 `json:"ipBlocksDeleted"`
}

type CleanupStatus struct {
	TotalTopics     int64 `json:"totalTopics"`
	TotalAssets     int64 `json:"totalAssets"`
	TotalAccounts   int   `json:"totalAccounts"`
	OldTopics       int64 `json:"oldTopics"`
	OldAssets       int64 `json:"oldAssets"`
	LastCleanupTime int64 `json:"lastCleanupTime,omitempty"`
	EstimatedSpace  int64 `json:"estimatedSpace"`
}

func CleanupData(w http.ResponseWriter, r *http.Request) {
	if code, err := ParamSessionToken(r); err != nil {
		ErrResponse(w, code, err)
		return
	}

	var req CleanupRequest
	if err := ParseRequest(r, w, &req); err != nil {
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	if req.RetentionDays <= 0 {
		req.RetentionDays = 90
	}

	if req.RetentionDays > 7300 {
		ErrResponse(w, http.StatusBadRequest, errors.New("retention days cannot exceed 7300 (20 years)"))
		return
	}

	clientIP := getClientIP(r)
	cleanupType := "dry run"
	if !req.DryRun {
		cleanupType = "actual"
	}

	LogMsg(fmt.Sprintf("[Cleanup] 开始执行清理操作 - 类型: %s, 保留天数: %d, 包含文件: %t, 客户端IP: %s",
		cleanupType, req.RetentionDays, req.IncludeAssets, clientIP))

	startTime := time.Now().UnixNano()

	var response CleanupResponse
	var dbErr error

	if req.DryRun {
		dbErr = runDryRunCleanup(req, &response)
	} else {
		dbErr = runActualCleanup(req, &response)
	}

	if dbErr != nil {
		LogMsg(fmt.Sprintf("[Cleanup] 清理操作失败 - 错误: %v", dbErr))
		ErrResponse(w, http.StatusInternalServerError, dbErr)
		return
	}

	response.ProcessingTime = (time.Now().UnixNano() - startTime) / 1000000

	WriteResponse(w, response)

	LogMsg(fmt.Sprintf("[Cleanup] 清理操作完成 - 删除消息: %d, 删除文件: %d, 释放空间: %s, 影响账户: %d, 处理时间: %dms, 客户端IP: %s",
		response.DeletedTopics, response.DeletedAssets, formatBytes(response.FreedBytes),
		response.AffectedAccounts, response.ProcessingTime, clientIP))
}

func runDryRunCleanup(req CleanupRequest, response *CleanupResponse) error {
	cutoffTime := time.Now().Unix() - (req.RetentionDays * 86400)

	var topicCount int64
	var assetCount int64
	var channelCount int64
	var tagCount int64
	var accounts []store.Account

	query := store.DB

	if req.AccountID != nil {
		if err := store.DB.First(&store.Account{}, *req.AccountID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("account not found")
			}
			return err
		}
		query = query.Where("id = ?", *req.AccountID)
		if err := query.Find(&accounts).Error; err != nil {
			return err
		}
	} else {
		if err := query.Find(&accounts).Error; err != nil {
			return err
		}
	}

	response.AffectedAccounts = len(accounts)

	for _, account := range accounts {
		if err := store.DB.Model(&store.Topic{}).
			Where("account_id = ? AND created < ?", account.ID, cutoffTime).
			Count(&topicCount).Error; err != nil {
			return err
		}
		response.DeletedTopics += topicCount

		if err := store.DB.Model(&store.Channel{}).
			Where("account_id = ? AND created < ?", account.ID, cutoffTime).
			Count(&channelCount).Error; err != nil {
			return err
		}
		response.DeletedChannels += channelCount

		if req.IncludeAssets {
			var assets []store.Asset
			if err := store.DB.Where("account_id = ? AND created < ?", account.ID, cutoffTime).
				Find(&assets).Error; err != nil {
				return err
			}
			assetCount = int64(len(assets))
			response.DeletedAssets += assetCount

			var size int64
			for _, asset := range assets {
				size += asset.Size
			}
			response.FreedBytes += size
		}

		if err := store.DB.Model(&store.Tag{}).
			Joins("JOIN topics ON tags.topic_id = topics.id").
			Where("topics.account_id = ? AND topics.created < ?", account.ID, cutoffTime).
			Count(&tagCount).Error; err != nil {
			return err
		}
		response.DeletedTags += tagCount
	}

	return nil
}

func runActualCleanup(req CleanupRequest, response *CleanupResponse) error {
	cutoffTime := time.Now().Unix() - (req.RetentionDays * 86400)
	batchSize := 1000

	var accounts []store.Account

	query := store.DB

	if req.AccountID != nil {
		if err := store.DB.First(&store.Account{}, *req.AccountID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("account not found")
			}
			return err
		}
		query = query.Where("id = ?", *req.AccountID)
		if err := query.Find(&accounts).Error; err != nil {
			return err
		}
	} else {
		if err := query.Find(&accounts).Error; err != nil {
			return err
		}
	}

	response.AffectedAccounts = len(accounts)

	for _, account := range accounts {
		for {
			var topics []store.Topic
			err := store.DB.Where("account_id = ? AND created < ?", account.ID, cutoffTime).
				Limit(batchSize).
				Find(&topics).Error

			if err != nil {
				return err
			}

			if len(topics) == 0 {
				break
			}

			var topicIDs []uint
			for _, topic := range topics {
				topicIDs = append(topicIDs, topic.ID)
			}

			err = store.DB.Transaction(func(tx *gorm.DB) error {
				if req.IncludeAssets {
					var assets []store.Asset
					if res := tx.Where("topic_id IN ?", topicIDs).Find(&assets).Error; res != nil {
						return res
					}
					response.DeletedAssets += int64(len(assets))

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
				return err
			}

			response.DeletedTopics += int64(len(topics))

			if len(topics) < batchSize {
				break
			}
		}

		err := store.DB.Transaction(func(tx *gorm.DB) error {
			var emptyChannels []store.Channel
			if res := tx.Where("account_id = ? AND created < ? AND topic_revision = 0", account.ID, cutoffTime).
				Find(&emptyChannels).Error; res != nil {
				return res
			}

			for _, channel := range emptyChannels {
				if res := tx.Where("id = ?", channel.ID).Delete(&store.Channel{}).Error; res != nil {
					return res
				}
				if res := tx.Where("channel_id = ?", channel.ID).Delete(&store.ChannelSlot{}).Error; res != nil {
					return res
				}
				if res := tx.Where("channel_id = ?", channel.ID).Delete(&store.Member{}).Error; res != nil {
					return res
				}
				response.DeletedChannels++
			}

			return nil
		})

		if err != nil {
			return err
		}

		go garbageCollect(&account)
	}

	cleanupOrphanedAssets(cutoffTime)

	return nil
}

func cleanupOrphanedAssets(cutoffTime int64) {
	err := store.DB.Transaction(func(tx *gorm.DB) error {
		if res := tx.Where("created < ? AND topic_id = 0", cutoffTime).
			Delete(&store.Asset{}).Error; res != nil {
			return res
		}
		return nil
	})

	if err != nil {
		ErrMsg(err)
	}
}

func GetCleanupStatus(w http.ResponseWriter, r *http.Request) {
	if code, err := ParamSessionToken(r); err != nil {
		ErrResponse(w, code, err)
		return
	}

	var status CleanupStatus
	cutoffTime := time.Now().Unix() - (90 * 86400)

	if err := store.DB.Model(&store.Topic{}).Where("created < ?", cutoffTime).Count(&status.OldTopics).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	if err := store.DB.Model(&store.Asset{}).Where("created < ?", cutoffTime).Count(&status.OldAssets).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	var totalSize int64
	if err := store.DB.Model(&store.Asset{}).Where("created < ?", cutoffTime).
		Select("COALESCE(SUM(size), 0)").Scan(&totalSize).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}
	status.EstimatedSpace = totalSize

	if err := store.DB.Model(&store.Topic{}).Count(&status.TotalTopics).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	if err := store.DB.Model(&store.Asset{}).Count(&status.TotalAssets).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	var accounts []store.Account
	if err := store.DB.Find(&accounts).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}
	status.TotalAccounts = len(accounts)

	lastCleanup := getNumConfigValue(CNFCleanupLastRun, 0)
	if lastCleanup > 0 {
		status.LastCleanupTime = lastCleanup
	}

	WriteResponse(w, status)
}

func SetCleanupConfig(w http.ResponseWriter, r *http.Request) {
	if code, err := ParamSessionToken(r); err != nil {
		ErrResponse(w, code, err)
		return
	}

	var config map[string]interface{}
	if err := ParseRequest(r, w, &config); err != nil {
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	clientIP := getClientIP(r)
	LogMsg(fmt.Sprintf("[Cleanup] 更新清理配置 - 客户端IP: %s", clientIP))

	err := store.DB.Transaction(func(tx *gorm.DB) error {
		if enabled, ok := config["cleanupEnabled"].(bool); ok {
			if res := tx.Exec(`INSERT OR REPLACE INTO configs (config_id, bool_value) VALUES (?, ?) ON CONFLICT(config_id) DO UPDATE SET bool_value = ?`,
				CNFCleanupEnabled, enabled, enabled); res.Error != nil {
				return res.Error
			}
		}

		if hours, ok := config["cleanupIntervalHours"].(float64); ok {
			if res := tx.Exec(`INSERT OR REPLACE INTO configs (config_id, num_value) VALUES (?, ?) ON CONFLICT(config_id) DO UPDATE SET num_value = ?`,
				CNFCleanupIntervalHours, int64(hours), int64(hours)); res.Error != nil {
				return res.Error
			}
		}

		if days, ok := config["messageRetentionDays"].(float64); ok {
			if res := tx.Exec(`INSERT OR REPLACE INTO configs (config_id, num_value) VALUES (?, ?) ON CONFLICT(config_id) DO UPDATE SET num_value = ?`,
				CNFMessageRetentionDays, int64(days), int64(days)); res.Error != nil {
				return res.Error
			}
		}

		if days, ok := config["assetRetentionDays"].(float64); ok {
			if res := tx.Exec(`INSERT OR REPLACE INTO configs (config_id, num_value) VALUES (?, ?) ON CONFLICT(config_id) DO UPDATE SET num_value = ?`,
				CNFAssetRetentionDays, int64(days), int64(days)); res.Error != nil {
				return res.Error
			}
		}

		return nil
	})

	if err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	WriteResponse(w, map[string]string{"status": "ok"})
}

func GetCleanupConfig(w http.ResponseWriter, r *http.Request) {
	if code, err := ParamSessionToken(r); err != nil {
		ErrResponse(w, code, err)
		return
	}

	config := map[string]interface{}{
		"cleanupEnabled":       getBoolConfigValue(CNFCleanupEnabled, false),
		"cleanupIntervalHours": getNumConfigValue(CNFCleanupIntervalHours, 24),
		"messageRetentionDays": getNumConfigValue(CNFMessageRetentionDays, 90),
		"assetRetentionDays":   getNumConfigValue(CNFAssetRetentionDays, 180),
	}

	WriteResponse(w, config)
}

func formatBytes(bytes int64) string {
	if bytes == 0 {
		return "0 B"
	}
	sizes := []string{"B", "KB", "MB", "GB", "TB"}
	unit := 0
	value := float64(bytes)
	for value >= 1024 && unit < len(sizes)-1 {
		value /= 1024
		unit++
	}
	return strconv.FormatFloat(value, 'f', 2, 64) + " " + sizes[unit]
}
