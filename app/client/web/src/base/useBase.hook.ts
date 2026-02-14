import { useState, useContext, useEffect } from 'react'
import { AppContext, AppState, AppActions } from '../context/AppContext'
import { DisplayContext, DisplayState } from '../context/DisplayContext'
import { Card, Channel, Profile } from 'databag-client-sdk'

interface SessionWithListeners {
  addProfileListener: (fn: (profile: Profile) => void) => void
  removeProfileListener: (fn: (profile: Profile) => void) => void
  addCardListener: (fn: (cards: Card[]) => void) => void
  removeCardListener: (fn: (cards: Card[]) => void) => void
  addChannelListener: (fn: (data: { channels: Channel[]; cardId: string | null }) => void) => void
  addLoadedListener: (fn: (loaded: boolean) => void) => void
  removeChannelListener: (fn: (data: { channels: Channel[]; cardId: string | null }) => void) => void
  removeLoadedListener: (fn: (loaded: boolean) => void) => void
}

export function useBase() {
  const app = useContext(AppContext) as { state: AppState; actions: AppActions }
  const display = useContext(DisplayContext) as { state: DisplayState }
  const [state, setState] = useState({
    strings: display.state.strings,
    scheme: display.state.scheme,
    profileSet: null as null | boolean,
    cardSet: null as null | boolean,
    channelSet: null as null | boolean,
    contentSet: null as null | boolean,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    const { strings, scheme } = display.state
    updateState({ strings, scheme })
  }, [display.state])

  useEffect(() => {
    const setProfile = (profile: Profile) => {
      updateState({ profileSet: Boolean(profile.name) })
    }
    const setCards = (cards: Card[]) => {
      updateState({ cardSet: cards.length > 0 })
    }
    const setChannels = ({ channels, cardId }: { channels: Channel[]; cardId: string | null }) => {
      updateState({ channelSet: cardId && channels.length > 0 })
    }
    const setContent = (loaded: boolean) => {
      updateState({ contentSet: loaded })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { identity, contact, content } = (app.state.session as SessionWithListeners | null | any) || {}
    identity?.addProfileListener(setProfile)
    contact?.addCardListener(setCards)
    content?.addChannelListener(setChannels)
    content?.addLoadedListener(setContent)

    return () => {
      identity?.removeProfileListener(setProfile)
      contact?.removeCardListener(setCards)
      content?.removeChannelListener(setChannels)
      content?.removeLoadedListener(setContent)
    }
  }, [])

  const actions = {}

  return { state, actions }
}
