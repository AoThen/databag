package databag

import (
	"encoding/json"
	"net/http"
)

func GetIPBlocks(w http.ResponseWriter, r *http.Request) {
	code, err := ParamAdminToken(r)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}

	blocks, err := GetIPBlocksFromDB()
	if err != nil {
		LogMsg(err.Error())
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	type blockResponse struct {
		IP        string `json:"ip"`
		Reason    string `json:"reason"`
		BlockedAt int64  `json:"blockedAt"`
		ExpiresAt int64  `json:"expiresAt"`
		FailCount int    `json:"failCount"`
	}

	var response struct {
		Blocks []blockResponse `json:"blocks"`
	}

	for _, block := range blocks {
		response.Blocks = append(response.Blocks, blockResponse{
			IP:        block.IP,
			Reason:    block.Reason,
			BlockedAt: block.BlockedAt.Unix(),
			ExpiresAt: block.ExpiresAt.Unix(),
			FailCount: block.FailCount,
		})
	}

	data, _ := json.Marshal(response)
	WriteResponse(w, data)
}
