package databag

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func AddIPBlock(w http.ResponseWriter, r *http.Request) {
	code, err := ParamAdminToken(r)
	if err != nil {
		ErrResponse(w, code, err)
		return
	}

	vars := mux.Vars(r)
	ip := vars["ip"]
	if ip == "" {
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	reason := r.FormValue("reason")
	if reason == "" {
		reason = "manual block"
	}

	durationStr := r.FormValue("duration")
	duration := 24
	if durationStr != "" {
		if d, err := strconv.Atoi(durationStr); err == nil {
			duration = d
		}
	}

	err = BlockIP(ip, reason, duration)
	if err != nil {
		LogMsg(err.Error())
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	WriteResponse(w, []byte("{}"))
}
