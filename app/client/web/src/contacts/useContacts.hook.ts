import { useState, useContext, useEffect } from 'react'
import { AppContext, AppState } from '../context/AppContext'
import { RingContext, RingActions } from '../context/RingContext'
import { DisplayContext, DisplayState } from '../context/DisplayContext'
import { Card } from 'databag-client-sdk'

export function useContacts() {
  const app = useContext(AppContext) as { state: AppState }
  const display = useContext(DisplayContext) as { state: DisplayState }
  const ring = useContext(RingContext) as { actions: RingActions }
  const [state, setState] = useState({
    strings: display.state.strings,
    cards: [] as Card[],
    filtered: [] as Card[],
    sortAsc: false,
    filter: '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  const compare = (a: Card, b: Card) => {
    const aval = `${a.handle}/${a.node}`
    const bval = `${b.handle}/${b.node}`
    if (aval < bval) {
      return state.sortAsc ? 1 : -1
    } else if (aval > bval) {
      return state.sortAsc ? -1 : 1
    }
    return 0
  }

  const select = (c: Card) => {
    if (!state.filter) {
      return true
    }
    const value = state.filter.toLowerCase()
    if (c.name && c.name.toLowerCase().includes(value)) {
      return true
    }
    const handle = c.node ? `${c.handle}/${c.node}` : c.handle
    if (handle.toLowerCase().includes(value)) {
      return true
    }
    return false
  }

  useEffect(() => {
    const contact = app.state.session?.getContact?.()
    if (!contact) return
    const setCards = (cards: Card[]) => {
      const filtered = cards.filter((card) => !card.blocked)
      updateState({ cards: filtered })
    }
    contact.addCardListener(setCards)
    return () => {
      contact.removeCardListener(setCards)
    }
  }, [])

  useEffect(() => {
    const filtered = state.cards.sort(compare).filter(select)
    updateState({ filtered })
  }, [state.sortAsc, state.filter, state.cards])

  const actions = {
    call: async (card: Card) => {
      await ring.actions.call(card)
    },
    toggleSort: () => {
      const sortAsc = !state.sortAsc
      updateState({ sortAsc })
    },
    setFilter: (filter: string) => {
      updateState({ filter })
    },
    cancel: async (cardId: string) => {
      const contact = app.state.session?.getContact?.()
      if (contact) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await contact.disconnectCard(cardId)
      }
    },
    accept: async (cardId: string) => {
      const contact = app.state.session?.getContact?.()
      if (contact) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await contact.connectCard(cardId)
      }
    },
    resync: async (cardId: string) => {
      const contact = app.state.session?.getContact?.()
      if (contact) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await contact.resyncCard(cardId)
      }
    },
  }

  return { state, actions }
}
