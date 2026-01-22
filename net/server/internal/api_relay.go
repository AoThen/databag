package databag

import (
	"errors"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var relayer = websocket.Upgrader{}
var relayMutex sync.Mutex
var left *websocket.Conn
var right *websocket.Conn
var cur bool = false

// Status handler for websocket connection
func Relay(w http.ResponseWriter, r *http.Request) {

	relayer.CheckOrigin = func(r *http.Request) bool {
		return isAllowedOrigin(r.Header.Get("Origin"))
	}

	// accept websocket connection
	conn, err := relayer.Upgrade(w, r, nil)
	if err != nil {
		ErrMsg(err)
		return
	}
	defer conn.Close()
	conn.SetReadLimit(APPBodyLimit)

	relayMutex.Lock()
	if cur {
		right = conn
		PrintMsg("CONNECTED RIGHT")
	} else {
		left = conn
		PrintMsg("CONNECTED LEFT")
	}
	cur = !cur
	relayMutex.Unlock()

	for {
		t, m, res := conn.ReadMessage()
		if res != nil {
			ErrMsg(res)
			return
		}
		if t != websocket.TextMessage {
			ErrMsg(errors.New("invalid websocket message type"))
			return
		}

		relayMutex.Lock()
		if conn == left && right != nil {
			if err := right.WriteMessage(websocket.TextMessage, m); err != nil {
				relayMutex.Unlock()
				ErrMsg(err)
				return
			}
		}
		if conn == right && left != nil {
			if err := left.WriteMessage(websocket.TextMessage, m); err != nil {
				relayMutex.Unlock()
				ErrMsg(err)
				return
			}
		}
		relayMutex.Unlock()
	}
}
