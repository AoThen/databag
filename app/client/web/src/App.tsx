import React, { useContext, useState, useEffect } from 'react'
import { Root } from './root/Root'
import { Access } from './access/Access'
import { Service } from './service/Service'
import { Session } from './session/Session'
import { createTheme, MantineProvider, virtualColor } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import './App.css'
import '@mantine/core/styles.css'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import classes from './App.module.css'
import { DisplayContext } from './context/DisplayContext'
import { ContextType } from './context/ContextType'
import { IconContext } from "react-icons";
import { LightTheme, DarkTheme, SepiaTheme, BlueTheme, PurpleTheme } from './constants/Colors';

const appTheme = createTheme({
  primaryColor: 'databag-green',
  primaryShade: { light: 6, dark: 7 },
  colors: {
    'databag-green': ['#eef6f2', '#cce5d9', '#aad4bf', '#68c4af', '#559e83', '#559e83', '#3c7759', '#2b5540', '#1a3326', '#09110d'],
    'dark-surface': ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999'],
    'light-surface': ['#ffffff', '#eeeeee', '#dddddd', '#cccccc', '#bbbbbb', '#aaaaaa', '#999999', '#888888', '#777777', '#666666'],
    'sepia-surface': ['#f5e6d3', '#e8d9c0', '#d4c4a8', '#c4b39c', '#a09080', '#8b7b6b', '#6b5b4b', '#4a3c2a', '#2d251a', '#1a130d'],
    'blue-surface': ['#e8f4fc', '#d0e8f5', '#b8dff0', '#a0c0d8', '#7090a8', '#4a7aad', '#2d5a87', '#1a365d', '#0f1f33', '#050a11'],
    'purple-surface': ['#f3e8ff', '#e8dcf5', '#d8c8f0', '#b8a8c8', '#9080a8', '#6b5b7b', '#4a3b5b', '#2d1f3d', '#1a1325', '#0d0912'],
    'dark-text': ['#ffffff', '#eeeeee', '#dddddd', '#cccccc', '#bbbbbb', '#aaaaaa', '#999999', '#666666', '#444444', '#222222'],
    'light-text': ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999'],
    'sepia-text': ['#4a3c2a', '#6b5b4b', '#8b7b6b', '#a09080', '#c4b39c', '#d4c4a8', '#e8d9c0', '#f5e6d3', '#faf3e8', '#ffffff'],
    'blue-text': ['#1a365d', '#2d5a87', '#4a7aad', '#7090a8', '#a0c0d8', '#b8dff0', '#d0e8f5', '#e8f4fc', '#f5fafc', '#ffffff'],
    'purple-text': ['#2d1f3d', '#4a3b5b', '#6b5b7b', '#9080a8', '#b8a8c8', '#d8c8f0', '#e8dcf5', '#f3e8ff', '#faf8fc', '#ffffff'],
    'dark-databag-green': ['#99bb99', '#559e83', '#559e83', '#559e83', '#559e83', '#559e83', '#559e83', '#559e83', '#559e83', '#559e83'],
    'light-databag-green': ['#888888', '#448844', '#448844', '#448844', '#448844', '#448844', '#448844', '#448844', '#448844', '#448844'],
    'sepia-databag-green': ['#f5e6d3', '#d4c4a8', '#8b6914', '#8b6914', '#8b6914', '#8b6914', '#6b5b4b', '#4a3c2a', '#2d251a', '#1a130d'],
    'blue-databag-green': ['#e8f4fc', '#b8dff0', '#3182ce', '#3182ce', '#3182ce', '#3182ce', '#2d5a87', '#1a365d', '#0f1f33', '#050a11'],
    'purple-databag-green': ['#f3e8ff', '#d8c8f0', '#805ad5', '#805ad5', '#805ad5', '#805ad5', '#4a3b5b', '#2d1f3d', '#1a1325', '#0d0912'],
    'dark-tab': ['#111111', '#222222', '#333333', '#444444', '#444444', '#444444', '#444444', '#444444', '#444444', '#333333'],
    'light-tab': ['#dddddd', '#cccccc', '#bbbbbb', '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa', '#8fbea7'],
    'sepia-tab': ['#e8d9c0', '#d4c4a8', '#c4b39c', '#a09080', '#8b7b6b', '#6b5b4b', '#4a3c2a', '#2d251a', '#1a130d', '#f5e6d3'],
    'blue-tab': ['#d0e8f5', '#b8dff0', '#a0c0d8', '#7090a8', '#4a7aad', '#2d5a87', '#1a365d', '#0f1f33', '#050a11', '#e8f4fc'],
    'purple-tab': ['#e8dcf5', '#d8c8f0', '#b8a8c8', '#9080a8', '#6b5b7b', '#4a3b5b', '#2d1f3d', '#1a1325', '#0d0912', '#f3e8ff'],
    'dark-status': ['#555555', '#cccccc', '#aaaa44', '#aa44aa', '#22aacc', '#44aa44', '#dd6633', '#888888', '#888888', '#888888'],
    'light-status': ['#555555', '#cccccc', '#aaaa44', '#aa44aa', '#22aacc', '#44aa44', '#dd6633', '#888888', '#888888', '#888888'],
    'sepia-status': ['#d4940a', '#5d8a3e', '#6b5b9a', '#3d7ab8', '#8b6914', '#7a8b6b', '#c4b39c', '#a09080', '#8b7b6b', '#6b5b4b'],
    'blue-status': ['#d69e2e', '#38a169', '#667eea', '#4299e1', '#2b6cb0', '#4a7aad', '#a0c0d8', '#7090a8', '#4a7aad', '#2d5a87'],
    'purple-status': ['#9f7aea', '#48bb78', '#667eea', '#4299e1', '#9f7aea', '#8b7aa8', '#b8a8c8', '#9080a8', '#6b5b7b', '#4a3b5b'],
    dbgreen: virtualColor({
      name: 'dbgreen',
      dark: 'dark-databag-green',
      light: 'light-databag-green',
    }),
    tab: virtualColor({
      name: 'tab',
      dark: 'dark-tab',
      light: 'light-tab',
    }),
    surface: virtualColor({
      name: 'surface',
      dark: 'dark-surface',
      light: 'light-surface',
    }),
    status: virtualColor({
      name: 'status',
      dark: 'dark-status',
      light: 'light-status',
    }),
    text: virtualColor({
      name: 'text',
      dark: 'dark-text',
      light: 'light-text',
    }),
  },
})

const themeColorsMap: Record<string, typeof LightTheme> = {
  dark: DarkTheme,
  light: LightTheme,
  sepia: SepiaTheme,
  blue: BlueTheme,
  purple: PurpleTheme,
}

function getThemeStyleVars(colors: typeof LightTheme) {
  return {
    '--color-remote-area': colors.remoteArea,
    '--color-local-area': colors.localArea,
    '--color-splash-area': colors.splashArea,
    '--color-base-area': colors.baseArea,
    '--color-frame-area': colors.frameArea,
    '--color-icon-area': colors.iconArea,
    '--color-header-area': colors.headerArea,
    '--color-footer-area': colors.footerArea,
    '--color-modal-area': colors.modalArea,
    '--color-item-area': colors.itemArea,
    '--color-input-area': colors.inputArea,
    '--color-hover-area': colors.hoverArea,
    '--color-notice-area': colors.noticeArea,
    '--color-selected-area': colors.selectedArea,
    '--color-enabled-area': colors.enabledArea,
    '--color-disabled-area': colors.disabledArea,
    '--color-main-text': colors.mainText,
    '--color-description-text': colors.descriptionText,
    '--color-hint-text': colors.hintText,
    '--color-active-text': colors.activeText,
    '--color-idle-text': colors.idleText,
    '--color-placeholder-text': colors.placeholderText,
    '--color-link-text': colors.linkText,
    '--color-label-text': colors.labelText,
    '--color-alert-text': colors.alertText,
    '--color-item-border': colors.itemBorder,
    '--color-input-border': colors.inputBorder,
    '--color-section-border': colors.sectionBorder,
    '--color-header-border': colors.headerBorder,
    '--color-drawer-border': colors.drawerBorder,
    '--color-unsaved': colors.unsaved,
    '--color-connected': colors.connected,
    '--color-connecting': colors.connecting,
    '--color-requested': colors.requested,
    '--color-pending': colors.pending,
    '--color-confirmed': colors.confirmed,
  }
}

function getCSSOverride(colors: typeof LightTheme) {
  return `
    :root {
      --mantine-color-surface-0: ${colors.baseArea} !important;
      --mantine-color-surface-1: ${colors.frameArea} !important;
      --mantine-color-surface-2: ${colors.modalArea} !important;
      --mantine-color-surface-3: ${colors.itemArea} !important;
      --mantine-color-surface-4: ${colors.hoverArea} !important;
      --mantine-color-surface-5: ${colors.inputArea} !important;
      --mantine-color-text-0: ${colors.mainText} !important;
      --mantine-color-text-1: ${colors.descriptionText} !important;
      --mantine-color-text-2: ${colors.hintText} !important;
      --mantine-color-text-3: ${colors.activeText} !important;
      --mantine-color-text-4: ${colors.idleText} !important;
      --mantine-color-text-5: ${colors.placeholderText} !important;
      --mantine-color-text-6: ${colors.labelText} !important;
      --mantine-color-text-7: ${colors.hintText} !important;
      --mantine-color-text-8: ${colors.idleText} !important;
      --mantine-color-text-9: ${colors.placeholderText} !important;
      --mantine-color-tab-1: ${colors.frameArea} !important;
      --mantine-color-tab-2: ${colors.selectedArea} !important;
      --mantine-color-tab-3: ${colors.hoverArea} !important;
      --mantine-color-dbgreen-1: ${colors.enabledArea} !important;
      --mantine-color-status-0: ${colors.unsaved} !important;
      --mantine-color-status-1: ${colors.connected} !important;
      --mantine-color-status-2: ${colors.connecting} !important;
      --mantine-color-status-3: ${colors.requested} !important;
      --mantine-color-status-4: ${colors.pending} !important;
      --mantine-color-status-5: ${colors.confirmed} !important;
      --mantine-color-status-6: ${colors.disabledArea} !important;
      --mantine-color-input-border: ${colors.inputBorder} !important;
      --mantine-color-item-border: ${colors.itemBorder} !important;
      --mantine-color-placeholder-text: ${colors.placeholderText} !important;
      --mantine-color-label-text: ${colors.labelText} !important;
      --color-base-area: ${colors.baseArea} !important;
      --color-frame-area: ${colors.frameArea} !important;
      --color-main-text: ${colors.mainText} !important;
      --color-description-text: ${colors.descriptionText} !important;
      --color-hint-text: ${colors.hintText} !important;
      --color-header-area: ${colors.headerArea} !important;
      --color-footer-area: ${colors.footerArea} !important;
      --color-modal-area: ${colors.modalArea} !important;
      --color-item-area: ${colors.itemArea} !important;
      --color-input-area: ${colors.inputArea} !important;
      --color-selected-area: ${colors.selectedArea} !important;
      --color-hover-area: ${colors.hoverArea} !important;
      --color-link-text: ${colors.linkText} !important;
      --color-alert-text: ${colors.alertText} !important;
      --color-text: ${colors.mainText} !important;
      --color-icon-area: ${colors.iconArea} !important;
    }
  `
}

const router = createHashRouter([
  {
    element: <Root />,
    children: [
      { path: 'access', element: <Access /> },
      { path: 'session', element: <Session /> },
      { path: 'service', element: <Service /> },
      { path: '*', element: <></> },
    ],
  },
])

export function App() {
  const display = useContext(DisplayContext) as ContextType
  const scheme = display.state ? display.state.scheme : undefined
  const themeKey = display.state ? display.state.theme : 'light'
  const themeColors = themeColorsMap[themeKey] || LightTheme

  const isCustomTheme = ['sepia', 'blue', 'purple'].includes(themeKey)
  const mantineScheme = isCustomTheme ? 'light' : scheme

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={classes.app} style={getThemeStyleVars(themeColors) as React.CSSProperties}>
      <IconContext.Provider value={{ size: "1.5em" }}>
      <MantineProvider forceColorScheme={mantineScheme} theme={appTheme} withCssVariables={false}>
        <style>{isCustomTheme ? getCSSOverride(themeColors) : ''}</style>
        <ModalsProvider>
          {mounted && <RouterProvider router={router} />}
        </ModalsProvider>
      </MantineProvider>
      </IconContext.Provider>
    </div>
  )
}
