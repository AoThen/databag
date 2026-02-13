import React, { ReactNode, createContext } from 'react'
import { useDisplayContext } from './useDisplayContext.hook'
import { ContextType } from './ContextType'

export interface DisplayTheme {
  value: string
  label: string
}

export interface DisplayLanguage {
  value: string
  label: string
}

export interface DisplayState {
  layout: string | null
  themes: DisplayTheme[]
  theme: string | null
  scheme: string | null
  colors: Record<string, string>
  menuStyle: Record<string, string>
  languages: DisplayLanguage[]
  language: string | null
  strings: Record<string, string>
  dateFormat: string
  timeFormat: string
  audioId: string | null
  audioInputs: Array<{ value: string; label: string }>
  videoId: string | null
  videoInputs: Array<{ value: string; label: string }>
  width?: number
  height?: number
}

export interface DisplayActions {
  setTheme: (theme: string) => void
  setLanguage: (code: string) => void
  setDateFormat: (dateFormat: string) => void
  setTimeFormat: (timeFormat: string) => void
  setAudioInput: (audioId: string | null) => void
  setVideoInput: (videoId: string | null) => void
}

export const DisplayContext = createContext<ContextType<DisplayState, DisplayActions>>({} as ContextType<DisplayState, DisplayActions>)

export function DisplayContextProvider({ children }: { children: ReactNode }) {
  const { state, actions } = useDisplayContext()
  return <DisplayContext.Provider value={{ state, actions }}>{children}</DisplayContext.Provider>
}
