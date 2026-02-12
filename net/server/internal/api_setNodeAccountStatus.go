package databag

import (
	"databag/internal/store"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
	"time"
)

// SetNodeAccountStatus sets disabled status of account
func SetNodeAccountStatus(w http.ResponseWriter, r *http.Request) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	params := mux.Vars(r)
	accountID, res := strconv.ParseUint(params["accountID"], 10, 32)

	if res != nil {
		LogMsg(timestamp + " ERROR: failed to parse accountID: " + res.Error())
		ErrResponse(w, http.StatusBadRequest, res)
		return
	}

	if code, err := ParamSessionToken(r); err != nil {
		LogMsg(timestamp + " ERROR: unauthorized access attempt for accountID=" + params["accountID"])
		ErrResponse(w, code, err)
		return
	}

	var flag bool
	if err := ParseRequest(r, w, &flag); err != nil {
		LogMsg(timestamp + " ERROR: failed to parse request for accountID=" + params["accountID"] + ": " + err.Error())
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	action := "block"
	if !flag {
		action = "unblock"
	}

	LogMsg(timestamp + " INFO: account " + action + " operation started, accountID=" + params["accountID"])

	if err := store.DB.Model(store.Account{}).Where("id = ?", accountID).Update("disabled", flag).Error; err != nil {
		LogMsg(timestamp + " ERROR: failed to update account status, accountID=" + params["accountID"] + ", error=" + err.Error())
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	LogMsg(timestamp + " INFO: account " + action + " operation completed, accountID=" + params["accountID"] + ", disabled=" + strconv.FormatBool(flag))

	WriteResponse(w, nil)
}
