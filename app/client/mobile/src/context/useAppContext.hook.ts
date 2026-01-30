import {useState, useEffect, useRef} from 'react';
import {DatabagSDK, Service, Session, Focus} from 'databag-client-sdk';
import {NativeModules, Platform, PermissionsAndroid} from 'react-native';
import {SessionStore} from '../SessionStore';
import {NativeCrypto} from '../NativeCrypto';
import {LocalStore} from '../LocalStore';
import {StagingFiles} from '../StagingFiles';
import messaging from '@react-native-firebase/messaging';
import {UnsentTopic} from 'AppContext';

const DATABAG_DB = 'db_v251.db';
const SETTINGS_DB = 'ls_v003.db';

async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    await messaging().requestPermission();
  } else {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
}

const databag = new DatabagSDK(
  {
    channelTypes: ['sealed', 'superbasic'],
  },
  new NativeCrypto(),
  new StagingFiles(),
);

const notifications = [
  {event: 'contact.addCard', messageTitle: 'New Contact Request'},
  {event: 'contact.updateCard', messageTitle: 'Contact Update'},
  {event: 'content.addChannel.superbasic', messageTitle: 'New Topic'},
  {event: 'content.addChannel.sealed', messageTitle: 'New Topic'},
  {event: 'content.addChannelTopic.superbasic', messageTitle: 'New Topic Message'},
  {event: 'content.addChannelTopic.sealed', messageTitle: 'New Topic Message'},
  {event: 'ring', messageTitle: 'Incoming Call'},
];

export function useAppContext() {
  const local = useRef(new LocalStore());
  const sdk = useRef(databag);
  const topics = useRef(new Map<string, UnsentTopic>());
  const [state, setState] = useState({
    service: null as null | Service,
    session: null as null | Session,
    focus: null as null | Focus,
    favorite: [] as {cardId: null | string; channelId: string}[],
    fullDayTime: false,
    monthFirstDate: true,
    fontSize: 0,
    keyboardOffset: 0,
    lanaguge: null as null | string,
    initialized: false,
    showWelcome: false,
    sharing: null as null | {cardId: string; channelId: string; filePath: string; mimeType: string},
    createSealed: true,
  });

  const updateState = (value: any) => {
    setState(s => ({...s, ...value}));
  };

  const setup = async () => {
    try {
      // 设置超时以防止长时间阻塞
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      );

      // 并行初始化数据库和基本设置，添加超时保护
      const [localDbReady, settingsData, locale] = await Promise.race([
        Promise.all([
          local.current.open(SETTINGS_DB),
          (async () => {
            // 并行读取所有设置，添加错误处理
            try {
              const [
                favoriteRaw,
                timeFormat,
                dateFormat,
                setLanguage,
                fontSizeRaw,
                keyboardOffsetRaw,
                createSealedRaw
              ] = await Promise.all([
                local.current.get('favorite', JSON.stringify([])),
                local.current.get('time_format', '12h'),
                local.current.get('date_format', 'month_first'),
                local.current.get('language', null),
                local.current.get('font_size', '0'),
                local.current.get('keyboard_offset', '0'),
                local.current.get('create_sealed', 'true')
              ]);
              
              return {
                favorite: JSON.parse(favoriteRaw),
                fullDayTime: timeFormat === '24h',
                monthFirstDate: dateFormat === 'month_first',
                setLanguage,
                fontSize: parseInt(fontSizeRaw, 10) || 0,
                keyboardOffset: parseInt(keyboardOffsetRaw, 10) || 0,
                createSealed: createSealedRaw === 'true'
              };
            } catch (err) {
              // 如果设置读取失败，使用默认值
              return {
                favorite: [],
                fullDayTime: false,
                monthFirstDate: true,
                setLanguage: null,
                fontSize: 0,
                keyboardOffset: 0,
                createSealed: true
              };
            }
          })(),
          (async () => {
            // 获取设备语言，添加错误处理
            try {
              return Platform.OS === 'ios' 
                ? NativeModules.SettingsManager?.settings.AppleLocale || NativeModules.SettingsManager?.settings.AppleLanguages[0]
                : NativeModules.I18nManager?.localeIdentifier;
            } catch (err) {
              return 'en';
            }
          })()
        ]),
        timeoutPromise
      ]);

      const {favorite, fullDayTime, monthFirstDate, setLanguage, fontSize, keyboardOffset, createSealed} = settingsData;
      const defaultLanguage = locale?.slice(0, 2) || '';
      const lang = setLanguage ? setLanguage : defaultLanguage;
      const language = lang === 'fr' ? 'fr' : lang === 'es' ? 'es' : lang === 'pt' ? 'pt' : lang === 'de' ? 'de' : lang === 'ru' ? 'ru' : lang === 'el' ? 'el' : lang === 'zh' ? 'zh' : 'en';

      // 优化：只创建一个SessionStore实例，避免重复初始化
      const sessionStore = new SessionStore();
      await sessionStore.open(DATABAG_DB);
      
      // 并行初始化SDK和获取store引用，添加错误处理
      const [store, session] = await Promise.race([
        Promise.all([
          Promise.resolve(sessionStore),
          sdk.current.initOfflineStore(sessionStore)
        ]).catch(err => {
          console.log('SDK initialization failed:', err);
          return [sessionStore, null];
        }),
        timeoutPromise
      ]);
      
      if (session) {
        updateState({session, fullDayTime, monthFirstDate, fontSize, keyboardOffset, createSealed, language, favorite, initialized: true});
      } else {
        updateState({fullDayTime, monthFirstDate, language, fontSize, keyboardOffset, createSealed, initialized: true});
      }
    } catch (err) {
      console.log('App initialization failed:', err);
      // 即使初始化失败，也要标记为已初始化以避免无限加载
      updateState({
        fullDayTime: false,
        monthFirstDate: true,
        language: 'en',
        fontSize: 0,
        keyboardOffset: 0,
        createSealed: true,
        initialized: true
      });
    }
  };

  useEffect(() => {
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      return {token, type: 'fcm'};
    } catch (err) {
      console.log(err);
      return {token: '', type: ''};
    }
  };

  const actions = {
    getUnsent: (cardId: string, channelId: string) => {
      const id = `${cardId}:${channelId}`;
      if (topics.current.has(id)) {
        return topics.current.get(id);
      }
      return {message: null, assets: []};
    },
    setUnsent: (cardId: string, channelId: string, topic: UnsentTopic) => {
      const id = `${cardId}:${channelId}`;
      topics.current.set(id, topic);
    },
    setMonthFirstDate: async (monthFirstDate: boolean) => {
      updateState({monthFirstDate});
      await local.current.set('date_format', monthFirstDate ? 'month_first' : 'day_first');
    },
    setFullDayTime: async (fullDayTime: boolean) => {
      updateState({fullDayTime});
      await local.current.set('time_format', fullDayTime ? '24h' : '12h');
    },
    setFontSize: async (fontSize: number) => {
      updateState({fontSize});
      await local.current.set('font_size', fontSize.toString());
    },
    setKeyboardOffset: async (keyboardOffset: number) => {
      updateState({keyboardOffset});
      await local.current.set('keyboard_offset', keyboardOffset.toString());
    },
    setCreateSealed: async (createSealed: boolean) => {
      updateState({createSealed});
      await local.current.set('create_sealed', createSealed ? 'true' : 'false');
    },
    setLanguage: async (language: string) => {
      updateState({language});
      await local.current.set('language', language);
    },
    setFavorite: async (favorite: {cardId: string | null; channelId: string}[]) => {
      updateState({favorite});
      await local.current.set('favorite', JSON.stringify(favorite));
    },
    setShowWelcome: async (showWelcome: boolean) => {
      updateState({showWelcome});
    },
    accountLogin: async (username: string, password: string, node: string, secure: boolean, code: string) => {
      const deviceToken = await getToken();

      const params = {
        topicBatch: 16,
        tagBatch: 16,
        channelTypes: ['test'],
        pushType: deviceToken.type,
        deviceToken: deviceToken.token,
        notifications: notifications,
        deviceId: '0011',
        version: '0.0.1',
        appName: 'databag',
      };

      const login = await sdk.current.login(username, password, node, secure, code, params);
      updateState({session: login, showWelcome: false});
    },
    accountLogout: async (all: boolean) => {
      if (state.session) {
        await local.current.clear('favorite');
        await sdk.current.logout(state.session, all);
        updateState({session: null});
      }
    },
    accountRemove: async () => {
      if (state.session) {
        await local.current.clear('favorite');
        await sdk.current.remove(state.session);
        updateState({session: null});
      }
    },
    accountCreate: async (handle: string, password: string, node: string, secure: boolean, token: string) => {
      const deviceToken = await getToken();

      const params = {
        topicBatch: 16,
        tagBatch: 16,
        channelTypes: ['test'],
        pushType: deviceToken.type,
        deviceToken: deviceToken.token,
        notifications: notifications,
        deviceId: '0011',
        version: '0.0.1',
        appName: 'databag',
      };
      const session = await sdk.current.create(handle, password, node, secure, token, params);
      updateState({session, showWelcome: true});
    },
    accountAccess: async (node: string, secure: boolean, token: string) => {
      const deviceToken = await getToken();

      const params = {
        topicBatch: 16,
        tagBatch: 16,
        channelTypes: ['test'],
        pushType: deviceToken.type,
        deviceToken: deviceToken.token,
        notifications: notifications,
        deviceId: '0011',
        version: '0.0.1',
        appName: 'databag',
      };
      const session = await sdk.current.access(node, secure, token, params);
      updateState({session, showWelcome: false});
    },
    setFocus: async (cardId: string | null, channelId: string) => {
      if (state.session) {
        const focus = await state.session.setFocus(cardId, channelId);
        updateState({focus});
      }
    },
    clearFocus: () => {
      if (state.session) {
        state.session.clearFocus();
        updateState({focus: null});
      }
    },
    getAvailable: async (node: string, secure: boolean) => {
      return await sdk.current.available(node, secure);
    },
    getUsername: async (username: string, token: string, node: string, secure: boolean) => {
      return await sdk.current.username(username, token, node, secure);
    },
    adminLogin: async (token: string, node: string, secure: boolean, code: string) => {
      const service = await sdk.current.configure(node, secure, token, code);
      updateState({service});
    },
    adminLogout: async () => {
      updateState({service: null});
    },
    setSharing: (sharing: {cardId: string; channelId: string; filePath: string; mimeType: string}) => {
      updateState({sharing});
    },
    clearSharing: () => {
      updateState({sharing: null});
    },
    requestPermission: async () => {
      await requestUserPermission();
    },
  };

  return {state, actions};
}
