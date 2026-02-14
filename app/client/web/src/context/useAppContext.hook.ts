import { useState, useEffect, useRef } from 'react'
import { DatabagSDK, Session, Focus } from 'databag-client-sdk'
import { SessionStore } from '../SessionStore'
import { WebCrypto } from '../WebCrypto'
import { StagingFiles } from '../StagingFiles'

const databag = new DatabagSDK({ channelTypes: ['sealed', 'superbasic'] }, new WebCrypto(), new StagingFiles())

const notifications = [
  { event: 'contact.addCard', messageTitle: 'New Contact Request' },
  { event: 'contact.updateCard', messageTitle: 'Contact Update' },
  { event: 'content.addChannel.superbasic', messageTitle: 'New Topic' },
  { event: 'content.addChannel.sealed', messageTitle: 'New Topic' },
  { event: 'content.addChannelTopic.superbasic', messageTitle: 'New Topic Message' },
  { event: 'content.addChannelTopic.sealed', messageTitle: 'New Topic Message' },
  { event: 'ring', messageTitle: 'Incoming Call' },
]

export function useAppContext() {
  const sdk = useRef(databag)
  const [state, setState] = useState<{ session: Session | null; focus: Focus | null; service?: ({ token?: string } & { getMembers: () => Promise<import('databag-client-sdk').Member[]>; createMemberAccess: () => Promise<string>; resetMemberAccess: (accountId: number) => Promise<string>; blockMember: (accountId: number, disabled: boolean) => Promise<void>; removeMember: (accountId: number) => Promise<void>; }) | null }>({
    session: null,
    focus: null,
    service: null,
  })

  const updateState = (value: { session?: Session | null; focus?: Focus | null; service?: ({ token?: string } & { getMembers: () => Promise<import('databag-client-sdk').Member[]>; createMemberAccess: () => Promise<string>; resetMemberAccess: (accountId: number) => Promise<string>; blockMember: (accountId: number, disabled: boolean) => Promise<void>; removeMember: (accountId: number) => Promise<void>; }) | null }) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const store = new SessionStore()
    const session: Session | null = await sdk.current.initOnlineStore(store)
    if (session) {
      updateState({ session })
    }
  }

  const actions = {
    accountLogin: async (username: string, password: string, node: string, secure: boolean, code: string) => {
      const params = {
        topicBatch: 16,
        tagBatch: 16,
        channelTypes: ['test'],
        pushType: '',
        deviceToken: '',
        notifications: notifications,
        deviceId: '0011',
        version: '0.0.1',
        appName: 'databag',
      }
      const login = await sdk.current.login(username, password, node, secure, code, params)
      updateState({ session: login })
    },
    accountLogout: async (all: boolean) => {
      if (state.session) {
        await sdk.current.logout(state.session, all)
        updateState({ session: null, focus: null })
      }
    },
    accountCreate: async (handle: string, password: string, node: string, secure: boolean, token: string) => {
      const params = {
        topicBatch: 16,
        tagBatch: 16,
        channelTypes: ['test'],
        pushType: '',
        deviceToken: '',
        notifications: notifications,
        deviceId: '0011',
        version: '0.0.1',
        appName: 'databag',
      }
      const session = await sdk.current.create(handle, password, node, secure, token, params)
      updateState({ session })
    },
    accountAccess: async (node: string, secure: boolean, token: string) => {
      const params = {
        topicBatch: 16,
        tagBatch: 16,
        channelTypes: ['test'],
        pushType: '',
        deviceToken: '',
        notifications: notifications,
        deviceId: '0011',
        version: '0.0.1',
        appName: 'databag',
      }
      const session = await sdk.current.access(node, secure, token, params)
      updateState({ session })
    },
    setFocus: async (cardId: string | null, channelId: string) => {
      if (state.session) {
        const focus = await state.session.setFocus(cardId, channelId)
        updateState({ focus })
      }
    },
    clearFocus: () => {
      if (state.session) {
        state.session.clearFocus()
        updateState({ focus: null })
      }
    },
    getAvailable: async (node: string, secure: boolean) => {
      return await sdk.current.available(node, secure)
    },
    getUsername: async (username: string, token: string, node: string, secure: boolean) => {
      return await sdk.current.username(username, token, node, secure)
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setProfileImage: async (_server: string, _appToken: string, _image: string) => {
      console.log('[AppContext] setProfileImage not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSeal: async (_server: string, _appToken: string, _seal: string, _password: string) => {
      console.log('[AppContext] setSeal not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clearSeal: async (_server: string, _appToken: string) => {
      console.log('[AppContext] clearSeal not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setProfile: async (_server: string, _appToken: string, _profile: unknown) => {
      console.log('[AppContext] setProfile not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNotification: async (_server: string, _appToken: string, _enable: boolean) => {
      console.log('[AppContext] setNotification not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setRegistry: async (_server: string, _appToken: string, _enable: boolean) => {
      console.log('[AppContext] setRegistry not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setMFAuth: async (_server: string, _appToken: string, _enable: boolean) => {
      console.log('[AppContext] setMFAuth not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    confirmMFAuth: async (_server: string, _appToken: string, _code: string) => {
      console.log('[AppContext] confirmMFAuth not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disableMFAuth: async (_server: string, _appToken: string) => {
      console.log('[AppContext] disableMFAuth not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLogin: async (_server: string, _appToken: string, _username: string, _password: string) => {
      console.log('[AppContext] setLogin not implemented')
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logout: async (_appToken: string) => {
      console.log('[AppContext] logout not implemented')
    },
    adminLogin: async (token: string, node: string, secure: boolean, code: string) => {
      const configuredService = await sdk.current.configure(node, secure, token, code)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateState({ session: state.session, focus: state.focus, service: configuredService as any })
    },
    adminLogout: async () => {
      updateState({ session: state.session, focus: state.focus, service: null })
    },
  }

  return { state, actions }
}
