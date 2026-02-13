import React, { ReactNode, createContext } from 'react'
import { useAppContext } from './useAppContext.hook'
import { ContextType } from './ContextType'

export interface AppState {
  session: null | import('databag-client-sdk').Session
  focus: null | import('databag-client-sdk').Focus
  service?: unknown
}

export interface AppActions {
  accountLogin: (username: string, password: string, node: string, secure: boolean, code: string) => Promise<void>
  accountLogout: (all: boolean) => Promise<void>
  accountCreate: (handle: string, password: string, node: string, secure: boolean, token: string) => Promise<void>
  accountAccess: (node: string, secure: boolean, token: string) => Promise<void>
  setFocus: (cardId: string | null, channelId: string) => Promise<void>
  clearFocus: () => void
  getAvailable: (node: string, secure: boolean, signal?: AbortSignal) => Promise<boolean>
  getUsername: (username: string, token: string, node: string, secure: boolean, signal?: AbortSignal) => Promise<boolean>
  adminLogin: (token: string, node: string, secure: boolean, code: string) => Promise<void>
  adminLogout: () => Promise<void>
  setProfileImage: (server: string, appToken: string, image: string) => Promise<void>
  setSeal: (server: string, appToken: string, seal: string, password: string) => Promise<void>
  clearSeal: (server: string, appToken: string) => Promise<void>
  setProfile: (server: string, appToken: string, profile: unknown) => Promise<void>
  setNotification: (server: string, appToken: string, enable: boolean) => Promise<void>
  setRegistry: (server: string, appToken: string, enable: boolean) => Promise<void>
  setMFAuth: (server: string, appToken: string, enable: boolean) => Promise<void>
  confirmMFAuth: (server: string, appToken: string, code: string) => Promise<void>
  disableMFAuth: (server: string, appToken: string) => Promise<void>
  setLogin: (server: string, appToken: string, username: string, password: string) => Promise<void>
  logout: (appToken: string) => Promise<void>
}

export const AppContext = createContext<ContextType<AppState, AppActions>>({} as ContextType<AppState, AppActions>)

export function AppContextProvider({ children }: { children: ReactNode }) {
  const { state, actions } = useAppContext()
  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>
}
