import { useState, useContext, useEffect } from 'react'
import { AppContext, AppState, AppActions } from '../context/AppContext'
import { DisplayContext, DisplayState } from '../context/DisplayContext'
import { Focus } from 'databag-client-sdk'

export function useSession() {
  const app = useContext(AppContext) as { state: AppState; actions: AppActions }
  const display = useContext(DisplayContext) as { state: DisplayState }
  const [state, setState] = useState({
    focus: null as Focus | null,
    layout: null,
    strings: display.state.strings,
    disconnected: false,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
      const session = app.state.session
      if (session) {
        const setStatus = (status: string) => {
          if (status === 'disconnected') {
            updateState({ disconnected: true })
          } else if (status === 'connected') {
            updateState({ disconnected: false })
          }
        }
        session.addStatusListener(setStatus)
        return () => session.removeStatusListener(setStatus)
      }
    }, [app.state.session])

  useEffect(() => {
    const { layout, strings } = display.state
    updateState({ layout, strings })
  }, [display.state])

  useEffect(() => {
    const { focus } = app.state
    updateState({ focus })
  }, [app.state])

  const actions = {}

  return { state, actions }
}
