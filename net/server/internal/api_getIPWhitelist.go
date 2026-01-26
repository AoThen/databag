package databag

import (
	"encoding/json"
	"net/http"
)

func GetIPWhitelist(w http.ResponseWriter, r *http.Request) {
	code, err := ParamAdminToken(r)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}

	whitelist, err := GetIPWhitelistFromDB()
	if err != nil {
		LogMsg(err.Error())
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	type whitelistResponse struct {
		IP        string `json:"ip"`
		Note      string `json:"note"`
		CreatedAt int64  `json:"createdAt"`
	}

	var response struct {
		Whitelist []whitelistResponse `json:"whitelist"`
	}

	for _, item := range whitelist {
		response.Whitelist = append(response.Whitelist, whitelistResponse{
			IP:        item.IP,
			Note:      item.Note,
			CreatedAt: item.CreatedAt.Unix(),
		})
	}

	data, _ := json.Marshal(response)
	WriteResponse(w, data)
}
