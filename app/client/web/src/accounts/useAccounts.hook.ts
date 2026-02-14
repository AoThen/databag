import { useEffect, useState, useContext } from 'react'
import { AppContext, AppState } from '../context/AppContext'
import { DisplayContext, DisplayState } from '../context/DisplayContext'
import type { Member } from 'databag-client-sdk'

export function useAccounts() {
  const app = useContext(AppContext) as { state: AppState }
  const display = useContext(DisplayContext) as { state: DisplayState }
  const [state, setState] = useState({
    layout: '',
    strings: display.state.strings,
    members: [] as Member[],
    loading: false,
    secretText: '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  const sync = async () => {
    if (!state.loading && app.state.service) {
      try {
        updateState({ loading: true })
        const members = await app.state.service.getMembers()
        updateState({ members, loading: false })
      } catch (err) {
        console.log(err)
        updateState({ loading: false })
      }
    }
  }

  useEffect(() => {
    const { layout, strings } = display.state
    updateState({ layout, strings })
  }, [display.state])

  const actions = {
    reload: sync,
    addAccount: async () => {
      if (!app.state.service) throw new Error('Service not available')
      return await app.state.service.createMemberAccess()
    },
    accessAccount: async (accountId: number) => {
      if (!app.state.service) throw new Error('Service not available')
      return await app.state.service.resetMemberAccess(accountId)
    },
    blockAccount: async (accountId: number, flag: boolean) => {
      console.log('[Accounts] Block account request:', { accountId, disabled: flag })
      if (!app.state.service) throw new Error('Service not available')
      try {
        await app.state.service.blockMember(accountId, flag)
        console.log('[Accounts] Block account success:', { accountId, disabled: flag })
        await sync()
        console.log('[Accounts] Account list reloaded')
      } catch (err) {
        console.error('[Accounts] Block account error:', { accountId, disabled: flag, error: err })
        throw err
      }
    },
    removeAccount: async (accountId: number) => {
      if (!app.state.service) throw new Error('Service not available')
      await app.state.service.removeMember(accountId)
      await sync()
    },
  }

  return { state, actions }
}
