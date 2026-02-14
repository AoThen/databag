import { useEffect, useState, useContext } from 'react'
import { AppContext, AppState } from '../context/AppContext'
import { DisplayContext, DisplayState } from '../context/DisplayContext'

export function useService() {
  const display = useContext(DisplayContext) as { state: DisplayState }
  const app = useContext(AppContext) as { state: AppState }

  const [state, setState] = useState({
    layout: null,
    strings: {},
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    const { layout, strings } = display.state
    updateState({ layout, strings })
  }, [display.state])

  const actions = {
    logout: async () => {
      await app.actions.adminLogout()
    },
  }

  return { state, actions }
}
