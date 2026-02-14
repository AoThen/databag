import { useState, useContext, useEffect, useRef } from 'react'
import { AppContext, AppState } from '../../context/AppContext'
import { MediaAsset } from '../../conversation/Conversation'

export function useVideoAsset(topicId: string, asset: MediaAsset) {
  const app = useContext(AppContext) as { state: AppState }
  const [state, setState] = useState({
    thumbUrl: null,
    dataUrl: null,
    loading: false,
    loadPercent: 0,
  })
  const cancelled = useRef(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  const setThumb = async () => {
    const { focus } = app.state
    const assetId = asset.video ? asset.video.thumb : asset.encrypted ? asset.encrypted.thumb : null
    if (focus && assetId != null) {
      try {
        const thumbUrl = await focus.getTopicAssetUrl(topicId, assetId)
        updateState({ thumbUrl })
      } catch (err) {
        console.log(err)
      }
    }
  }

  useEffect(() => {
    setThumb()
  }, [asset])

  const actions = {
    cancelLoad: () => {
      cancelled.current = true
    },
    loadVideo: async () => {
      const { focus } = app.state
      const assetId = asset.video ? asset.video.hd : asset.encrypted ? asset.encrypted.parts?.[0]?.partId : null
      if (focus && assetId && !state.loading && !state.dataUrl) {
        cancelled.current = false
        updateState({ loading: true, loadPercent: 0 })
        try {
          const dataUrl = await focus.getTopicAssetUrl(topicId, assetId, (loadPercent: number) => {
            updateState({ loadPercent })
            return !cancelled.current
          })
          updateState({ dataUrl, loading: false })
        } catch (err) {
          updateState({ loading: false })
          console.log(err)
        }
      }
    },
  }

  return { state, actions }
}
