package databag

import (
	"databag/internal/store"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// SetTopicRead marks a topic as read by the current user
func SetTopicRead(w http.ResponseWriter, r *http.Request) {

	// Check if read receipts feature is enabled
	if !IsReadReceiptsEnabled() {
		ErrResponse(w, http.StatusForbidden, errors.New("read receipts feature is disabled"))
		return
	}

	// Parse parameters
	params := mux.Vars(r)
	topicID := params["topicID"]
	if topicID == "" {
		ErrResponse(w, http.StatusBadRequest, errors.New("missing topicID"))
		return
	}

	// Get channel slot and account
	channelSlot, guid, code, err := getChannelSlot(r, true)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}
	act := &channelSlot.Account

	// Check if user has access to channel (get card from channel members)
	var card *store.Card
	for _, member := range channelSlot.Channel.Members {
		if member.Card.GUID == guid {
			card = &member.Card
			break
		}
	}
	if card == nil {
		ErrResponse(w, http.StatusUnauthorized, errors.New("user not in channel"))
		return
	}

	// Find the topic to mark as read
	var topic store.Topic
	if err = store.DB.Where("channel_id = ? AND topic_slot_id = ?", channelSlot.Channel.ID, topicID).First(&topic).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ErrResponse(w, http.StatusNotFound, err)
		} else {
			ErrResponse(w, http.StatusInternalServerError, err)
		}
		return
	}

	// Check if read record already exists
	var existingRead store.TopicRead
	err = store.DB.Where("topic_id = ? AND card_id = ?", topic.ID, card.ID).First(&existingRead).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	// Get current read count for the topic
	var readCount int64
	if err = store.DB.Model(&store.TopicRead{}).Where("topic_id = ?", topic.ID).Count(&readCount).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	// Transaction to update read status and increment count
	err = store.DB.Transaction(func(tx *gorm.DB) error {
		now := time.Now().Unix()

		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new read record
			topicRead := &store.TopicRead{
				TopicID:      topic.ID,
				CardID:       uint(card.ID),
				AccountID:    uint(card.ID),
				ReadTime:     now,
				ReadRevision: act.ChannelRevision + 1,
			}
			if res := tx.Create(topicRead).Error; res != nil {
				return res
			}
			// Increment read count (from 0 to 1)
			if res := tx.Model(&store.Topic{}).Where("id = ?", topic.ID).Update("read_count", readCount+1).Error; res != nil {
				return res
			}
		} else if existingRead.ReadTime == 0 {
			// Update existing read record (read_time was 0 for some reason)
			if res := tx.Model(&existingRead).Updates(map[string]interface{}{
				"read_time":     now,
				"read_revision": act.ChannelRevision + 1,
			}).Error; res != nil {
				return res
			}
		}

		// Update channel revision to trigger sync
		if res := tx.Model(&store.Channel{}).Where("id = ?", channelSlot.Channel.ID).Update("topic_revision", act.ChannelRevision+1).Error; res != nil {
			return res
		}
		if res := tx.Model(&store.ChannelSlot{}).Where("id = ?", channelSlot.ID).Update("revision", act.ChannelRevision+1).Error; res != nil {
			return res
		}
		if res := tx.Model(&store.Account{}).Where("id = ?", act.ID).Update("channel_revision", act.ChannelRevision+1).Error; res != nil {
			return res
		}

		return nil
	})
	if err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	// Send notification to topic author if they're different user
	if topic.GUID != card.GUID {
		if err = SetTopicReadNotification(&topic, card, strconv.Itoa(channelSlot.Channel.ID)); err != nil {
			ErrMsg(err)
		}
	}

	act.ChannelRevision++
	SetStatus(act)

	WriteResponse(w, nil)
}

// SetTopicReadNotification creates a notification for topic read receipt
func SetTopicReadNotification(topic *store.Topic, card *store.Card, channelID string) error {
	// Find author card to send notification to
	var authorCard store.Card
	if err := store.DB.Where("account_id = ? AND guid = ?", topic.AccountID, topic.GUID).First(&authorCard).Error; err != nil {
		return err
	}

	// Create notification
	notification := &store.Notification{
		Node:     authorCard.Node,
		GUID:     authorCard.GUID,
		Module:   APPNotifyTopicRead,
		Token:    authorCard.InToken,
		Revision: authorCard.ViewRevision,
		Event:    "content.readTopic." + topic.DataType,
	}

	if res := store.DB.Create(notification).Error; res != nil {
		return res
	}

	return nil
}
