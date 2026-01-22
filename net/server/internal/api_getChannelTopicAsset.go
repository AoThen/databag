package databag

import (
	"databag/internal/store"
	"errors"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
	"net/http"
	"path/filepath"
	"strings"
)

// GetChannelTopicAsset retrieves asset added to specified topic
func GetChannelTopicAsset(w http.ResponseWriter, r *http.Request) {

	// scan parameters
	params := mux.Vars(r)
	topicID := params["topicID"]
	assetID := params["assetID"]

	channelSlot, _, code, err := getChannelSlot(r, true)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}
	act := &channelSlot.Account

	// load asset
	var asset store.Asset
	if err = store.DB.Preload("Topic.TopicSlot").Where("channel_id = ? AND asset_id = ?", channelSlot.Channel.ID, assetID).First(&asset).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ErrResponse(w, http.StatusNotFound, err)
		} else {
			ErrResponse(w, http.StatusInternalServerError, err)
		}
		return
	}
	if asset.Topic.TopicSlot.TopicSlotID != topicID {
		ErrResponse(w, http.StatusNotFound, errors.New("invalid topic asset"))
		return
	}
	if asset.Transform == "" {
		ErrResponse(w, http.StatusUnauthorized, errors.New("transform source files not accessible"))
		return
	}

	// construct file path with path traversal protection
	basePath := getStrConfigValue(CNFAssetPath, APPDefaultPath)
	expectedPath := filepath.Clean(basePath + "/" + act.GUID + "/" + asset.AssetID)

	// verify path is within expected directory
	if !strings.HasPrefix(expectedPath, filepath.Clean(basePath)) {
		ErrResponse(w, http.StatusForbidden, errors.New("invalid path"))
		return
	}

	http.ServeFile(w, r, expectedPath)
}
