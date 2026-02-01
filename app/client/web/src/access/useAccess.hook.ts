import { useRef, useState, useContext, useEffect } from 'react'
import { DisplayContext } from '../context/DisplayContext'
import { AppContext } from '../context/AppContext'
import { ContextType } from '../context/ContextType'
import { useLocation } from 'react-router-dom'
import { requestCache } from '../utils/RequestCache'
import { DEBOUNCE_DELAY } from '../constants/Debounce'

export function useAccess() {
  const debounceAvailable = useRef(setTimeout(() => {}, 0))
  const debounceTaken = useRef(setTimeout(() => {}, 0))
  const app = useContext(AppContext) as ContextType
  const display = useContext(DisplayContext) as ContextType
  const url = useLocation();
  const [state, setState] = useState({
    layout: null,
    strings: display.state.strings,
    mode: '',
    username: '',
    password: '',
    confirm: '',
    token: '',
    code: '',
    scheme: '',
    language: '',
    loading: false,
    secure: false,
    host: '',
    available: 0,
    taken: false,
    checking: null as 'server' | 'username' | null, // 添加checking状态
    themes: display.state.themes,
    languages: display.state.languages,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    const params = new URLSearchParams(location.href)
    const search = url?.search;
    if (search && search.startsWith('?add=')) {
      updateState({ mode: 'create', token: search.substring(5) })
    } else if (search && search.startsWith('?reset=')) {
      updateState({ mode: 'reset', token: search.substring(7) })
    } else {
      updateState({ mode: 'account' })
    }

    const { protocol, host } = location
    updateState({ host, secure: protocol === 'https:' })
  }, [])

  useEffect(() => {
    const { username, token, host, secure, mode } = state
    if (mode === 'create') {
      checkTaken(username, token, host, secure)
      getAvailable(host, secure)
    }
  }, [state.mode, state.username, state.token, state.host, state.secure])

  const getAvailable = (node: string, secure: boolean) => {
    clearTimeout(debounceAvailable.current)
    const cacheKey = `available:${node}:${secure}`;
    
    debounceAvailable.current = setTimeout(async () => {
      try {
        // 使用requestCache进行请求缓存和取消
        const available = await requestCache.get(
          cacheKey,
          (signal?: AbortSignal) => app.actions.getAvailable(node, secure, signal)
        );
        updateState({ available, checking: null });
      } catch (err) {
        console.log('[useAccess] getAvailable error:', err);
        updateState({ available: 0, checking: null });
      }
    }, DEBOUNCE_DELAY.INPUT) // 从2000ms改为500ms
  }

  const checkTaken = (username: string, token: string, node: string, secure: boolean) => {
    updateState({ taken: false, checking: 'username' });
    clearTimeout(debounceTaken.current);
    const cacheKey = `taken:${username}:${token}:${node}:${secure}`;
    
    debounceTaken.current = setTimeout(async () => {
      try {
        // 使用requestCache进行请求缓存和取消
        const available = await requestCache.get(
          cacheKey,
          (signal?: AbortSignal) => app.actions.getUsername(username, token, node, secure, signal)
        );
        updateState({ taken: !available, checking: null });
      } catch (err) {
        console.log('[useAccess] checkTaken error:', err);
        updateState({ taken: false, checking: null });
      }
    }, DEBOUNCE_DELAY.INPUT) // 从2000ms改为500ms
  }

  useEffect(() => {
    const { layout, strings, themes, scheme, languages, language } = display.state
    updateState({
      layout,
      strings,
      themes: [...themes],
      scheme,
      languages,
      language,
    })
  }, [display.state])

  const actions = {
    setMode: (mode: string) => {
      updateState({ mode })
    },
    setUsername: (username: string) => {
      updateState({ username })
    },
    setPassword: (password: string) => {
      updateState({ password })
    },
    setConfirm: (confirm: string) => {
      updateState({ confirm })
    },
    setToken: (token: string) => {
      updateState({ token })
    },
    setCode: (code: string) => {
      updateState({ code })
    },
    setNode: (host: string) => {
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(host)
      updateState({ host, secure: !insecure })
    },
    setLanguage: (code: string) => {
      display.actions.setLanguage(code)
    },
    setTheme: (theme: string) => {
      display.actions.setTheme(theme)
    },
    setLoading: (loading: boolean) => {
      updateState({ loading })
    },
    accountLogin: async () => {
      const { username, password, host, secure, code } = state
      await app.actions.accountLogin(username, password, host, secure, code)
    },
    accountCreate: async () => {
      const { username, password, host, secure, token } = state
      await app.actions.accountCreate(username, password, host, secure, token)
    },
    accountAccess: async () => {
      const { host, secure, token } = state
      await app.actions.accountAccess(host, secure, token)
    },
    adminLogin: async () => {
      const { password, host, secure, code } = state
      await app.actions.adminLogin(password, host, secure, code)
    },
  }

  return { state, actions }
}
