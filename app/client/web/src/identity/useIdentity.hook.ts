import { useState, useContext, useEffect } from 'react'
import { DisplayContext, DisplayState } from '../context/DisplayContext'
import { AppContext, AppState, AppActions } from '../context/AppContext'
import { Profile } from 'databag-client-sdk'

export function useIdentity() {
  const app = useContext(AppContext) as { state: AppState; actions: AppActions }
  const display = useContext(DisplayContext) as { state: DisplayState }
  const [state, setState] = useState({
    all: false,
    strings: display.state.strings,
    profile: {} as Profile,
    profileSet: false,
    imageUrl: null,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    const identity = app.state.session?.getIdentity()
    if (!identity) {
      console.log('session not set in identity hook')
    } else {
      const setProfile = (profile: Profile) => {
        updateState({
          profile,
          profileSet: true,
          imageUrl: identity.getProfileImageUrl(),
        })
      }
      identity.addProfileListener(setProfile)
      return () => {
        identity.removeProfileListener(setProfile)
      }
    }
  }, [])

  const actions = {
    setAll: (all: boolean) => {
      updateState({ all })
    },
    logout: async () => {
      await app.actions.accountLogout(state.all)
    },
  }

  return { state, actions }
}
