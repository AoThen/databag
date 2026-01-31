package databag

import (
	"databag/internal/store"
	"errors"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// GetTopicReads retrieves read receipts for a topic
func GetTopicReads(w http.ResponseWriter, r *http.Request) {

	// Parse parameters
	params := mux.Vars(r)
	topicID := params["topicID"]
	if topicID == "" {
		ErrResponse(w, http.StatusBadRequest, errors.New("missing topicID"))
		return
	}

	// Get channel slot and account
	channelSlot, _, code, err := getChannelSlot(r, true)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}

	act := &channelSlot.Account

	// Find the topic
	var topic store.Topic
	if err = store.DB.Where("channel_id = ? AND topic_slot_id = ?", channelSlot.Channel.ID, topicID).First(&topic).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ErrResponse(w, http.StatusNotFound, err)
		} else {
			ErrResponse(w, http.StatusInternalServerError, err)
		}
		return
	}

	// Only topic author can view read receipts
	if topic.GUID != act.GUID {
		ErrResponse(w, http.StatusForbidden, errors.New("only topic author can view read receipts"))
		return
	}

	// Get all read records for this topic
	var topicReads []store.TopicRead
	if err = store.DB.Preload("Card.Account").Where("topic_id = ?", topic.ID).Find(&topicReads).Error; err != nil {
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	// Build response with read receipts
	type ReadReceipt struct {
		GUID     string `json:"guid"`
		Name     string `json:"name,omitempty"`
		Handle   string `json:"handle,omitempty"`
		ImageURL string `json:"imageUrl,omitempty"`
		ReadTime int64  `json:"readTime"`
	}

	var readReceipts []ReadReceipt
	for _, topicRead := range topicReads {
		receipt := ReadReceipt{
			GUID:     topicRead.Card.GUID,
			ReadTime: topicRead.ReadTime,
		}

		// Add profile information if available
		if topicRead.Card.AccountID != "" {
			var accountDetail store.AccountDetail
			if err := store.DB.Where("id = ?", topicRead.Card.AccountID).First(&accountDetail).Error; err == nil {
				receipt.Name = accountDetail.Name
				receipt.ImageURL = accountDetail.Image
			}
		}

		readReceipts = append(readReceipts, receipt)
	}

	type ReadResponse struct {
		ReadCount    int64         `json:"readCount"`
		ReadReceipts []ReadReceipt `json:"readBy"`
	}

	response := ReadResponse{
		ReadCount:    int64(len(readReceipts)),
		ReadReceipts: readReceipts,
	}

	WriteResponse(w, response)
}
