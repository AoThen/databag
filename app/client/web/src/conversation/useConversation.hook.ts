import { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { DisplayContext } from '../context/DisplayContext'
import { Focus, FocusDetail, Topic, Profile, Card, AssetType, AssetSource, TransformType } from 'databag-client-sdk'
import Resizer from 'react-image-file-resizer'
import { ErrorHandler, ErrorCategory } from '../utils/ErrorHandler'
import { ErrorCounter } from '../utils/ErrorCounter'

interface UploadAsset {
  type: string
  file: File
  position?: number
  label?: string
}

const IMAGE_SCALE_SIZE = 128 * 1024
const GIF_TYPE = 'image/gif'
const WEBP_TYPE = 'image/webp'
const LOAD_DEBOUNCE = 1000

const errorHandler = ErrorHandler.getInstance()
const errorCounter = ErrorCounter.getInstance()

function getImageThumb(file: File) {
  return new Promise<string>((resolve, reject) => {
    if ((file.type === GIF_TYPE || file.type === WEBP_TYPE) && file.size < IMAGE_SCALE_SIZE) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = function () {
        resolve(reader.result as string)
      }
      reader.onerror = function () {
        reject()
      }
    } else {
      Resizer.imageFileResizer(
        file,
        192,
        192,
        'JPEG',
        50,
        0,
        (uri) => {
          resolve(uri as string)
        },
        'base64',
        128,
        128
      )
    }
  })
}

function getVideoThumb(file: File, position?: number) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const timeupdate = function () {
      video.removeEventListener('timeupdate', timeupdate)
      video.pause()
      setTimeout(() => {
        const canvas = document.createElement('canvas')
        if (!canvas) {
          reject()
        } else {
          if (video.videoWidth > video.videoHeight) {
            canvas.width = 192
            canvas.height = Math.floor((192 * video.videoHeight) / video.videoWidth)
          } else {
            canvas.height = 192
            canvas.width = Math.floor((192 * video.videoWidth) / video.videoHeight)
          }
          const context = canvas.getContext('2d')
          if (!context) {
            reject()
          } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const image = canvas.toDataURL('image/jpeg', 0.75)
            resolve(image)
          }
        }
        canvas.remove()
        video.remove()
        URL.revokeObjectURL(url)
      }, 1000)
    }
    video.addEventListener('timeupdate', timeupdate)
    video.addEventListener('error', () => {
      reject()
      video.remove()
      URL.revokeObjectURL(url)
    })
    video.preload = 'metadata'
    video.src = url
    video.muted = true
    video.playsInline = true
    video.currentTime = position ? position : 0
    video.play()
  })
}

export function useConversation() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app = useContext(AppContext) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const display = useContext(DisplayContext) as any
  const [state, setState] = useState({
    detail: undefined as FocusDetail | null | undefined,
    strings: display.state.strings,
    cardId: null as null | string,
    detailSet: false,
    focus: null as Focus | null,
    layout: null,
    topics: [] as Topic[],
    filteredTopics: [] as Topic[],
    searchFilter: '',
    loaded: false,
    loadingMore: false,
    profile: null as Profile | null,
    cards: new Map<string, Card>(),
    host: false,
    sealed: false,
    access: false,
    subject: '',
    subjectNames: [],
    unknownContacts: 0,
    message: '',
    assets: [] as UploadAsset[],
    textColor: '#444444',
    textColorSet: false,
    textSize: 16,
    textSizeSet: false,
    progress: 0,
    offsync: false,
    markedReadTopics: new Set<string>(),
    isOneToOne: false,
    maxFetchedReadReceipts: 30,
    myTopicsCount: 0,
    lastReadReceiptRevision: null as number | null,
  })

  const updateState = (value: Partial<typeof state>) => {
    setState((s) => ({ ...s, ...value }))
  }

  const updateAsset = (index: number, value: Partial<UploadAsset>) => {
    setState((s) => ({
      ...s,
      assets: s.assets.map((asset, i) => 
        i === index ? { ...asset, ...value } : asset
      )
    }))
  }

  useEffect(() => {
    const { layout, strings } = display.state
    updateState({ layout, strings })
  }, [display.state])

  useEffect(() => {
    if (!state.searchFilter) {
      updateState({ filteredTopics: state.topics })
      return
    }
    
    const query = state.searchFilter.toLowerCase()
    const filtered = state.topics.filter((topic) => {
      if (!topic.data || !topic.data.text) return false
      return topic.data.text.toLowerCase().includes(query)
    })
    updateState({ filteredTopics: filtered })
  }, [state.searchFilter, state.topics])

  useEffect(() => {
    const host = state.cardId == null
    const sealed = state.detail ? state.detail.sealed : false
    const access = state.detail != null
    const subject = state.detail?.data?.subject ? state.detail.data.subject : null
    const cards = Array.from(state.cards.values())
    const card = cards.find((entry) => entry.cardId == state.cardId)
    const profileRemoved = state.detail?.members ? state.detail.members.filter((member) => state.profile?.guid != member.guid) : []
    const unhostedCards = profileRemoved.map((member) => state.cards.get(member.guid))
    const contactCards = card ? [card, ...unhostedCards] : unhostedCards
    const subjectCards = contactCards.filter((member) => Boolean(member))
    const subjectNames = subjectCards.map((member) => (member?.name ? member.name : member?.handle))
    const unknownContacts = contactCards.length - subjectCards.length
    
    const members = state.detail?.members || []
    const isOneToOne = state.cardId != null && members.length <= 2
    
    updateState({ host, sealed, access, subject, subjectNames, unknownContacts, detailSet: state.detail !== undefined, isOneToOne })
  }, [state.detail, state.cards, state.profile, state.cardId])

  useEffect(() => {
    if (state.profile && state.topics.length > 0 && state.cardId != null) {
      const myTopicsCount = state.topics.filter(t => t.guid === state.profile?.guid).length;
      updateState({ myTopicsCount });
    }
  }, [state.topics, state.cardId, state.profile])

  useEffect(() => {
    const focus = app.state.focus
    if (focus && state.loaded && state.topics.length > 0 && state.isOneToOne && state.myTopicsCount > 0) {
      const tryRefreshReadReceipts = async () => {
        try {
          const currentRevision = focus.getChannelRevision()
          if (currentRevision && state.lastReadReceiptRevision !== currentRevision) {
            await focus.fetchMoreReadReceipts(30)
            updateState({ lastReadReceiptRevision: currentRevision, maxFetchedReadReceipts: 30 })
          }
        } catch {
          // Silently ignore fetch errors
        }
      }
      tryRefreshReadReceipts()
    }
  }, [state.topics, state.isOneToOne, state.myTopicsCount])

  useEffect(() => {
    const focus = app.state.focus
    const { contact, identity } = app.state.session || {}
    if (focus && contact && identity) {
      const setTopics = (topics: Topic[]) => {
        if (topics) {
          const filtered = topics.filter((topic) => !topic.blocked)
          const sorted = filtered.sort((a, b) => {
            if (a.created < b.created) {
              return -1
            } else if (a.created > b.created) {
              return 1
            } else {
              return 0
            }
          })
          updateState({ topics: sorted, loaded: true })
        }
      }
      const setCards = (cards: Card[]) => {
        const contacts = new Map<string, Card>()
        cards.forEach((card) => {
          contacts.set(card.guid, card)
        })
        updateState({ cards: contacts })
      }
      const setProfile = (profile: Profile) => {
        updateState({ profile })
      }
      const setDetail = (focused: { cardId: string | null; channelId: string; detail: FocusDetail | null }) => {
        const detail = focused ? focused.detail : null
        const cardId = focused.cardId
        updateState({ detail, cardId })
      }
      const setOffsync = (offsync: boolean) => {
        updateState({ offsync });
      }
      updateState({ assets: [], message: '', topics: [], loaded: false, markedReadTopics: new Set<string>() })
      focus.addTopicListener(setTopics)
      focus.addDetailListener(setDetail)
      focus.addOffsyncListener(setOffsync)
      contact.addCardListener(setCards)
      identity.addProfileListener(setProfile)
      return () => {
        focus.removeTopicListener(setTopics)
        focus.removeDetailListener(setDetail)
        focus.removeOffsyncListener(setOffsync)
        contact.removeCardListener(setCards)
        identity.removeProfileListener(setProfile)
      }
    }
  }, [app.state.focus])

  useEffect(() => {
    const focus = app.state.focus
    if (focus && state.loaded && state.topics.length > 0 && state.cardId != null) {
      const unreadTopics = state.topics.filter(topic =>
        !topic.readByMe && topic.status === 'confirmed' && !state.markedReadTopics.has(topic.topicId)
      )
      if (unreadTopics.length > 0) {
        unreadTopics.forEach(topic => {
          state.markedReadTopics.add(topic.topicId)
          focus.markTopicRead(topic.topicId)
            .then(() => {
              errorCounter.clearRetrySchedule('markTopicRead', topic.topicId)
            })
            .catch((err: unknown) => {
              const appError = errorHandler.handle(err, {
                component: 'useConversation',
                action: 'markTopicRead',
                topicId: topic.topicId,
                channelId: state.cardId,
              })

              if (appError.category === ErrorCategory.AUTH || appError.category === ErrorCategory.NETWORK) {
                if (errorCounter.shouldRetry('markTopicRead', topic.topicId)) {
                  state.markedReadTopics.delete(topic.topicId)
                } else {
                  console.warn('[useConversation] markTopicRead retry timeout, topic:', topic.topicId, 'error:', appError)
                }
              }
            })
            .catch((err: unknown) => {
              const appError = errorHandler.handle(err, {
                component: 'useConversation',
                action: 'markTopicRead',
                topicId: topic.topicId,
                channelId: state.cardId,
              })

              if (appError.category === ErrorCategory.AUTH || appError.category === ErrorCategory.NETWORK) {
                if (errorCounter.shouldRetry('markTopicRead', topic.topicId)) {
                  state.markedReadTopics.delete(topic.topicId)
                }
              }
            })
        })
      }
    }
  }, [state.loaded, state.topics, state.cardId, app.state.focus])

  useEffect(() => {
    const focus = app.state.focus
    if (focus && state.loaded && state.topics.length > 0 && state.isOneToOne && state.myTopicsCount > 0) {
      const loadInitialReadReceipts = async () => {
        try {
          await focus.fetchMoreReadReceipts(30)
          updateState({ maxFetchedReadReceipts: 30 })
        } catch {
          // Silently ignore fetch errors
        }
      }
      loadInitialReadReceipts()
    }
  }, [state.loaded, state.isOneToOne, state.myTopicsCount])

  const actions = {
    close: () => {
      app.actions.clearFocus()
    },
    markAsRead: async (topicId: string) => {
      const focus = app.state.focus
      if (focus) {
        await focus.markTopicRead(topicId)
      }
    },
    loadMoreReadReceipts: async () => {
      const focus = app.state.focus
      if (focus && state.isOneToOne) {
        const fetchedCount = focus.getFetchedReadReceiptCount();
        if (fetchedCount < state.myTopicsCount) {
          try {
            await focus.fetchMoreReadReceipts(30);
            updateState({ maxFetchedReadReceipts: fetchedCount + 30 });
          } catch {
            // Silently ignore fetch errors
          }
        }
      }
    },
    setMessage: (message: string) => {
      updateState({ message })
    },
    setSearchFilter: (filter: string) => {
      updateState({ searchFilter: filter })
    },
    setTextSize: (textSize: number) => {
      const textSizeSet = true
      updateState({ textSize, textSizeSet })
    },
    setTextColor: (textColor: string) => {
      const textColorSet = true
      updateState({ textColor, textColorSet })
    },
    setThumbPosition: (index: number, position: number) => {
      updateAsset(index, { position })
    },
    setLabel: (index: number, label: string) => {
      updateAsset(index, { label })
    },
    removeAsset: (index: number) => {
      state.assets.splice(index, 1)
      updateState({ assets: [...state.assets] })
    },
    more: async () => {
      const focus = app.state.focus
      if (focus) {
        if (!state.loadingMore) {
          updateState({ loadingMore: true })
          await focus.viewMoreTopics()
          setTimeout(() => {
            updateState({ loadingMore: false })
          }, LOAD_DEBOUNCE)
        }
      }
    },
    send: async () => {
      const focus = app.state.focus
      const sealed = state.detail?.sealed ? true : false
      if (focus) {
        const sources = [] as AssetSource[]
        const uploadAssets = state.assets.map((asset) => {
          if (asset.type === 'image') {
            if (sealed) {
              sources.push({
                type: AssetType.Image,
                source: asset.file,
                transforms: [
                  { type: TransformType.Thumb, appId: `it${sources.length}`, thumb: () => getImageThumb(asset.file) },
                  { type: TransformType.Copy, appId: `ic${sources.length}` },
                ],
              })
              return { encrypted: { type: 'image', thumb: `it${sources.length - 1}`, parts: `ic${sources.length - 1}` } }
            } else {
              sources.push({
                type: AssetType.Image,
                source: asset.file,
                transforms: [
                  { type: TransformType.Thumb, appId: `it${sources.length}` },
                  { type: TransformType.Copy, appId: `ic${sources.length}` },
                ],
              })
              return { image: { thumb: `it${sources.length - 1}`, full: `ic${sources.length - 1}` } }
            }
          } else if (asset.type === 'video') {
            if (sealed) {
              sources.push({
                type: AssetType.Video,
                source: asset.file,
                transforms: [
                  { type: TransformType.Thumb, appId: `vt${sources.length}`, thumb: () => getVideoThumb(asset.file, asset.position) },
                  { type: TransformType.Copy, appId: `vc${sources.length}` },
                ],
              })
              return { encrypted: { type: 'video', thumb: `vt${sources.length - 1}`, parts: `vc${sources.length - 1}` } }
            } else {
              sources.push({
                type: AssetType.Video,
                source: asset.file,
                transforms: [
                  { type: TransformType.Thumb, appId: `vt${sources.length}`, position: asset.position },
                  { type: TransformType.HighQuality, appId: `vh${sources.length}` },
                  { type: TransformType.LowQuality, appId: `vl${sources.length}` },
                ],
              })
              return { video: { thumb: `vt${sources.length - 1}`, hd: `vh${sources.length - 1}`, lq: `vl${sources.length - 1}` } }
            }
          } else if (asset.type === 'audio') {
            if (sealed) {
              sources.push({ type: AssetType.Audio, source: asset.file, transforms: [{ type: TransformType.Copy, appId: `ac${sources.length}` }] })
              return { encrypted: { type: 'audio', label: asset.label, parts: `ac${sources.length - 1}` } }
            } else {
              sources.push({ type: AssetType.Audio, source: asset.file, transforms: [{ type: TransformType.Copy, appId: `ac${sources.length}` }] })
              return { audio: { label: asset.label, full: `ac${sources.length - 1}` } }
            }
          } else {
            const extension = asset.file.name.split('.').pop()
            const label = asset.file.name.split('.').shift()
            if (sealed) {
              sources.push({ type: AssetType.Binary, source: asset.file, transforms: [{ type: TransformType.Copy, appId: `bc${sources.length}` }] })
              return { encrypted: { type: 'binary', label, extension, parts: `bc${sources.length - 1}` } }
            } else {
              sources.push({ type: AssetType.Binary, source: asset.file, transforms: [{ type: TransformType.Copy, appId: `bc${sources.length}` }] })
              return { binary: { label, extension, data: `bc${sources.length - 1}` } }
            }
          }
        })
        const subject = (uploaded: { assetId: string; appId: string }[]) => {
          const assets = uploadAssets.map((asset) => {
            if (asset.encrypted) {
              const type = asset.encrypted.type
              const label = asset.encrypted.label
              const extension = asset.encrypted.extension
              const thumb = uploaded.find((upload) => upload.appId === asset.encrypted.thumb)?.assetId
              const parts = uploaded.find((upload) => upload.appId === asset.encrypted.parts)?.assetId
              if (type === 'image' || type === 'video') {
                return { encrypted: { type, thumb, parts } }
              } else if (type === 'audio') {
                return { encrypted: { type, label, parts } }
              } else {
                return { encrypted: { type, label, extension, parts } }
              }
            } else if (asset.image) {
              const thumb = uploaded.find((upload) => upload.appId === asset.image.thumb)?.assetId
              const full = uploaded.find((upload) => upload.appId === asset.image.full)?.assetId
              return { image: { thumb, full } }
            } else if (asset.video) {
              const thumb = uploaded.find((upload) => upload.appId === asset.video.thumb)?.assetId
              const hd = uploaded.find((upload) => upload.appId === asset.video.hd)?.assetId
              const lq = uploaded.find((upload) => upload.appId === asset.video.lq)?.assetId
              return { video: { thumb, hd, lq } }
            } else if (asset.audio) {
              const label = asset.audio.label
              const full = uploaded.find((upload) => upload.appId === asset.audio.full)?.assetId
              return { audio: { label, full } }
            } else {
              const data = uploaded.find((upload) => upload.appId === asset.binary.data)?.assetId
              const { label, extension } = asset.binary
              return { binary: { label, extension, data } }
            }
          })
          return { text: state.message, textColor: state.textColorSet ? state.textColor : null, textSize: state.textSizeSet ? state.textSize : null, assets: assets.length > 0 ? assets : null }
        }
        const upload = (progress: number) => {
          updateState({ progress })
        }
        await focus.addTopic(sealed, sealed ? 'sealedtopic' : 'superbasictopic', subject, sources, upload)
        updateState({ message: '', assets: [], progress: 0 })
      }
    },
    addImage: (file: File) => {
      const type = 'image'
      updateState({ assets: [...state.assets, { type, file }] })
    },
    addVideo: (file: File) => {
      const type = 'video'
      updateState({ assets: [...state.assets, { type, file }] })
    },
    addAudio: (file: File) => {
      const type = 'audio'
      updateState({ assets: [...state.assets, { type, file }] })
    },
    addBinary: (file: File) => {
      const type = 'binary'
      updateState({ assets: [...state.assets, { type, file }] })
    },
  }

  return { state, actions }
}
