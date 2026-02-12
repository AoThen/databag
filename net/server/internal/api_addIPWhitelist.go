package databag

import (
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func AddIPWhitelist(w http.ResponseWriter, r *http.Request) {
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

	ip = strings.TrimSpace(ip)
	if ip == "" {
		ErrResponse(w, http.StatusBadRequest, err)
		return
	}

	note := r.FormValue("note")
	if note == "" {
		note = "whitelisted IP"
	}

	err = AddIPToWhitelist(ip, note)
	if err != nil {
		LogMsg(err.Error())
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	WriteResponse(w, []byte("{}"))
}
