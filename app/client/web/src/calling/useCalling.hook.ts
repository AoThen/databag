import { useState, useContext, useEffect } from 'react'
import { RingContext, RingState, RingActions } from '../context/RingContext'
import { DisplayContext, DisplayState } from '../context/DisplayContext'
import { Card } from 'databag-client-sdk'

export function useCalling() {
  const ring = useContext(RingContext) as { state: RingState; actions: RingActions }
  const display = useContext(DisplayContext) as { state: DisplayState }

  const [state, setState] = useState({
    strings: display.state.strings,
    calls: [] as { callId: string; card: Card }[],
    calling: null as null | Card,
    localStream: null as null | MediaStream,
    remoteStream: null as null | MediaStream,
    localVideo: false,
    remoteVideo: false,
    audioEnabled: false,
    videoEnabled: false,
    connected: false,
    failed: false,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    const { calls, calling, localStream, remoteStream, localVideo, remoteVideo, audioEnabled, videoEnabled, connected, failed } = ring.state
    updateState({ calls, calling, localStream, remoteStream, localVideo, remoteVideo, audioEnabled, videoEnabled, connected, failed })
  }, [ring.state])

  const actions = ring.actions
  return { state, actions }
}
