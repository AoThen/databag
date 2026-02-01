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

	// load topic
	var topicSlot store.TopicSlot
	if err = store.DB.Where("channel_id = ? AND topic_slot_id = ?", channelSlot.Channel.ID, topicID).First(&topicSlot).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			code = http.StatusNotFound
		} else {
			code = http.StatusInternalServerError
		}
		ErrResponse(w, code, err)
		return
	}

	act := &channelSlot.Account

	WriteResponse(w, getTopicDetailModelWithReadStatus(&topicSlot, act))
}

func getTopicDetailModelWithReadStatus(slot *store.TopicSlot, account *store.Account) *TopicDetail {

	if slot.Topic == nil {
		return nil
	}

	transform := APPTransformComplete
	for _, asset := range slot.Topic.Assets {
		if asset.Status == APPAssetError {
			transform = APPTransformError
		} else if asset.Status == APPAssetWaiting && transform == APPTransformComplete {
			transform = APPTransformIncomplete
		}
	}

	// query if current user has read this topic
	var topicRead store.TopicRead
	err := store.DB.Where("topic_id = ? AND account_id = ?", slot.Topic.ID, account.ID).First(&topicRead).Error
	readByMe := (err == nil && topicRead.ReadTime > 0)

	LogMsg(fmt.Sprintf("[ReadReceipt] topicId=%s, accountId=%d, readByMe=%v, err=%v", slot.Topic.TopicSlotID, account.ID, readByMe, err))

	return &TopicDetail{
		GUID:      slot.Topic.GUID,
		DataType:  slot.Topic.DataType,
		Data:      slot.Topic.Data,
		Created:   slot.Topic.Created,
		Updated:   slot.Topic.Updated,
		Status:    slot.Topic.Status,
		Transform: transform,
		ReadByMe:  readByMe,
	}
}
