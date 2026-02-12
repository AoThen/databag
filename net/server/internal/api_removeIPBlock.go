package databag

import (
	"net/http"

	"github.com/gorilla/mux"
)

func RemoveIPBlock(w http.ResponseWriter, r *http.Request) {
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

	err = UnblockIP(ip)
	if err != nil {
		LogMsg(err.Error())
		ErrResponse(w, http.StatusInternalServerError, err)
		return
	}

	WriteResponse(w, []byte("{}"))
}
