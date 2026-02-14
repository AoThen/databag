import React, { ReactNode, createContext } from 'react'
import { useRingContext } from './useRingContext.hook'
import { ContextType } from './ContextType'

export interface RingState {
  calls: Array<{ callId: string; cardId: string }>
  calling: import('databag-client-sdk').Card | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  localVideo: boolean
  remoteVideo: boolean
  audioEnabled: boolean
  videoEnabled: boolean
  connected: boolean
  connectedTime: number
  failed: boolean
  fullscreen: boolean
}

export interface RingActions {
  call: (card: import('databag-client-sdk').Card) => Promise<void>
  accept: (callId: string, card: import('databag-client-sdk').Card) => Promise<void>
  ignore: (callId: string, card: import('databag-client-sdk').Card) => Promise<void>
  decline: (callId: string, card: import('databag-client-sdk').Card) => Promise<void>
  end: () => Promise<void>
  enableAudio: () => Promise<void>
  disableAudio: () => Promise<void>
  enableVideo: () => Promise<void>
  disableVideo: () => Promise<void>
  setFullscreen: (fullscreen: boolean) => void
}

export const RingContext = createContext<ContextType<RingState, RingActions>>({} as ContextType<RingState, RingActions>)

export function RingContextProvider({ children }: { children: ReactNode }) {
  const { state, actions } = useRingContext()
  return <RingContext.Provider value={{ state, actions }}>{children}</RingContext.Provider>
}
