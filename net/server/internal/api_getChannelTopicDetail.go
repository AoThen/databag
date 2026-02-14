package databag

import (
	"databag/internal/store"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
	"net/http"
)

// GetChannelTopicDetail retrieves topic subject and attributes
func GetChannelTopicDetail(w http.ResponseWriter, r *http.Request) {

	// scan parameters
	params := mux.Vars(r)
	topicID := params["topicID"]

	var subject Subject
	if err := ParseRequest(r, w, &subject); err != nil {
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	channelSlot, _, code, err := getChannelSlot(r, false)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}

	// load topic using topic_slot_id (which is the UUID from frontend)
	var topicSlot store.TopicSlot
	err = store.DB.Where("channel_id = ? AND topic_slot_id = ?", channelSlot.Channel.ID, topicID).First(&topicSlot).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			code = http.StatusNotFound
		} else {
			code = http.StatusInternalServerError
		}
		ErrResponse(w, code, err)
		return
	}

	act := &channelSlot.Account

	WriteResponse(w, getTopicDetailModelWithReadStatus(&channelSlot, &topicSlot, act))
}

func getTopicDetailModelWithReadStatus(slot *store.ChannelSlot, topicSlot *store.TopicSlot, account *store.Account) *TopicDetail {

	if topicSlot.Topic == nil {
		return nil
	}

	transform := APPTransformComplete
	for _, asset := range topicSlot.Topic.Assets {
		if asset.Status == APPAssetError {
			transform = APPTransformError
		} else if asset.Status == APPAssetWaiting && transform == APPTransformComplete {
			transform = APPTransformIncomplete
		}
	}

	// query if current user has read this topic
	// Find the current user's card in this channel
	var card *store.Card

	// First try to find card from channel members (for contact token)
	for _, member := range slot.Channel.Members {
		if member.Card.GUID == account.GUID {
			card = &member.Card
			break
		}
	}

	// If not found, try to find account's own card (for agent token)
	if card == nil {
		var accountCard store.Card
		if err := store.DB.Where("account_id = ? AND guid = ?", account.GUID, account.GUID).First(&accountCard).Error; err == nil {
			card = &accountCard
		}
	}

	var readByMe bool
	if card != nil {
		var topicRead store.TopicRead
		err := store.DB.Where("topic_id = ? AND card_id = ?", topicSlot.Topic.ID, card.ID).First(&topicRead).Error
		readByMe = (err == nil && topicRead.ReadTime > 0)
		LogMsg(fmt.Sprintf("[ReadReceipt] topicId=%d, cardId=%d, readByMe=%v, err=%v", topicSlot.Topic.TopicSlotID, card.ID, readByMe, err))
	} else {
		LogMsg(fmt.Sprintf("[ReadReceipt] topicId=%d, card not found, readByMe=false", topicSlot.Topic.TopicSlotID))
	}

	return &TopicDetail{
		GUID:      topicSlot.Topic.GUID,
		DataType:  topicSlot.Topic.DataType,
		Data:      topicSlot.Topic.Data,
		Created:   topicSlot.Topic.Created,
		Updated:   topicSlot.Topic.Updated,
		Status:    topicSlot.Topic.Status,
		Transform: transform,
		ReadByMe:  readByMe,
	}
}
