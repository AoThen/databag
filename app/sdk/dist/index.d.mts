interface Logging {
    error(m: any): void;
    warn(m: any): void;
    info(m: any): void;
}

type Card = {
    cardId: string;
    offsync: boolean;
    blocked: boolean;
    sealable: boolean;
    status: string;
    statusUpdated: number;
    guid: string;
    handle: string;
    name: string;
    description: string;
    location: string;
    imageUrl: string;
    imageSet: boolean;
    version: string;
    node: string;
};
type Call = {
    cardId: string;
    callId: string;
    calleeToken: string;
    ice: {
        urls: string;
        username: string;
        credential: string;
    }[];
};
type Revision = {
    account: number;
    profile: number;
    article: number;
    group: number;
    channel: number;
    card: number;
};
type Activity = {
    revision?: Revision;
    phone?: Call;
};
type Channel = {
    channelId: string;
    cardId: string | null;
    lastTopic: {
        guid: string;
        sealed: boolean;
        dataType: string;
        data: any;
        created: number;
        updated: number;
        status: string;
        transform: string;
    };
    blocked: boolean;
    unread: boolean;
    sealed: boolean;
    locked: boolean;
    dataType: string;
    data: any;
    created: number;
    updated: number;
    enableImage: boolean;
    enableAudio: boolean;
    enableVideo: boolean;
    enableBinary: boolean;
    members: Membership[];
};
type FocusDetail = {
    sealed: boolean;
    locked: boolean;
    dataType: string;
    data: any;
    enableImage: boolean;
    enableAudio: boolean;
    enableVideo: boolean;
    enableBinary: boolean;
    created: number;
    members: Membership[];
};
type Membership = {
    guid: string;
};
type Participant = {
    id: string;
    name: string;
    token: string;
    node: string;
    secure: boolean;
};
type Topic = {
    topicId: string;
    guid: string;
    sealed: boolean;
    locked: boolean;
    blocked: boolean;
    dataType: string;
    data: any;
    created: number;
    updated: number;
    status: string;
    transform: string;
    assets: Asset[];
    readCount?: number;
    readBy?: ReadReceipt[];
    readByMe?: boolean;
};
type ReadReceipt = {
    guid: string;
    name?: string;
    handle?: string;
    imageUrl?: string;
    readTime: number;
};
type Tag = {
    id: string;
    sealed: boolean;
    unsealed: boolean;
    guid: string;
    dataType: string;
    data: any;
    created: number;
    updated: number;
    sortOrder: number;
};
declare enum HostingMode {
    Inline = "inline",// sealed or unsealed 
    Split = "split",// sealed only, split file into blocks
    Basic = "basic"
}
declare enum TransformType {
    Copy = "copy",// server hosts copy of asset
    Thumb = "thumb",// extract thumb
    HighQuality = "high",// transcode at high quality
    LowQuality = "low"
}
declare enum AssetType {
    Image = "image",
    Video = "video",
    Audio = "audio",
    Binary = "binary"
}
type AssetSource = {
    type: AssetType;
    source: File | string;
    transforms: {
        type: TransformType;
        appId: string;
        position?: number;
        thumb?: () => Promise<string>;
    }[];
};
type Asset = {
    assetId: string;
    hosting: HostingMode;
};
type Group = {
    id: string;
    sealed: boolean;
    unsealed: boolean;
    dataType: string;
    data: string;
    created: number;
    updated: number;
    cards: string[];
};
type Article = {
    cardId: string;
    articleId: string;
    blocked: boolean;
    sealed: boolean;
    dataType: string;
    data: any;
    created: number;
    updated: number;
    contacts?: {
        cards: string[];
        groups: string[];
    };
};
type Config = {
    disabled: boolean;
    storageUsed: number;
    storageAvailable: number;
    forwardingAddress: string;
    searchable: boolean;
    allowUnsealed: boolean;
    pushEnabled: boolean;
    sealSet: boolean;
    sealUnlocked: boolean;
    enableIce: boolean;
    mfaEnabled: boolean;
    webPushKey: string;
};
type Profile = {
    guid: string;
    handle: string;
    name: string;
    description: string;
    location: string;
    imageUrl: string;
    imageSet: boolean;
    sealSet: boolean;
    version: string;
    node: string;
};
type Member = {
    accountId: number;
    guid: string;
    handle: string;
    name: string;
    imageUrl: string;
    disabled: boolean;
    storageUsed: number;
};
declare enum KeyType {
    RSA_4096 = "RSA4096",
    RSA_2048 = "RSA2048"
}
declare enum ICEService {
    Cloudflare = "cloudflare",
    Default = "default"
}
type Setup = {
    domain: string;
    accountStorage: number;
    enableImage: boolean;
    enableAudio: boolean;
    enableVideo: boolean;
    enableBinary: boolean;
    keyType: KeyType;
    pushSupported: boolean;
    allowUnsealed: boolean;
    transformSupported: boolean;
    enableIce: boolean;
    iceService: ICEService;
    iceUrl: string;
    iceUsername: string;
    icePassword: string;
    enableOpenAccess: boolean;
    openAccessLimit: number;
};
type Params = {
    channelTypes: string[];
};
type SessionParams = {
    pushType: string;
    deviceToken: string;
    notifications: {
        event: string;
        messageTitle: string;
    }[];
    deviceId: string;
    version: string;
    appName: string;
};
declare enum PushType {
    UPN = "upn",// unified push notifications
    Web = "web",// browser push notifications
    FCM = "fcm"
}
type PushParams = {
    endpoint: string;
    publicKey: string;
    auth: string;
    type: PushType;
};

interface Session {
    getSettings(): Settings;
    getIdentity(): Identity;
    getContact(): Contact;
    getAlias(): Alias;
    getAttribute(): Attribute;
    getContent(): Content;
    getRing(): Ring;
    setFocus(cardId: string | null, channelId: string): Promise<Focus>;
    clearFocus(): void;
    addStatusListener(ev: (status: string) => void): void;
    removeStatusListener(ev: (status: string) => void): void;
}
interface Link {
    setStatusListener(ev: (status: string) => Promise<void>): void;
    clearStatusListener(): void;
    setMessageListener(ev: (message: any) => Promise<void>): void;
    clearMessageListener(): void;
    getIce(): {
        urls: string;
        username: string;
        credential: string;
    }[];
    sendMessage(message: any): Promise<void>;
    close(): Promise<void>;
}
interface Ring {
    addRingingListener(ev: (calls: {
        cardId: string;
        callId: string;
    }[]) => void): void;
    removeRingingListener(ev: (calls: {
        cardId: string;
        callId: string;
    }[]) => void): void;
    accept(cardId: string, callId: string, contactNode: string): Promise<Link>;
    decline(cardId: string, callId: string, contactNode: string): Promise<void>;
    ignore(cardId: string, callId: string): Promise<void>;
}
interface Settings {
    getUsernameStatus(username: string): Promise<boolean>;
    setLogin(username: string, password: string): Promise<void>;
    enableNotifications(params?: PushParams): Promise<void>;
    disableNotifications(): Promise<void>;
    enableRegistry(): Promise<void>;
    disableRegistry(): Promise<void>;
    enableMFA(): Promise<{
        secretImage: string;
        secretText: string;
    }>;
    disableMFA(): Promise<void>;
    confirmMFA(code: string): Promise<void>;
    setSeal(password: string): Promise<void>;
    clearSeal(): Promise<void>;
    unlockSeal(password: string): Promise<void>;
    updateSeal(password: string): Promise<void>;
    forgetSeal(): Promise<void>;
    getBlockedCards(): Promise<{
        cardId: string;
        timestamp: number;
    }[]>;
    getBlockedChannels(): Promise<{
        cardId: string | null;
        channelId: string;
        timestamp: number;
    }[]>;
    getBlockedTopics(): Promise<{
        cardId: string | null;
        channelId: string;
        topicId: string;
        timestamp: number;
    }[]>;
    addConfigListener(ev: (config: Config) => void): void;
    removeConfigListener(ev: (config: Config) => void): void;
}
interface Identity {
    setProfileData(name: string, location: string, description: string): Promise<void>;
    setProfileImage(image: string): Promise<void>;
    getProfileImageUrl(): string;
    addProfileListener(ev: (profile: Profile) => void): void;
    removeProfileListener(ev: (profile: Profile) => void): void;
}
interface Contact {
    addCard(server: string | null, guid: string): Promise<string>;
    removeCard(cardId: string): Promise<void>;
    confirmCard(cardId: string): Promise<void>;
    connectCard(cardId: string): Promise<void>;
    addAndConnectCard(server: string | null, guid: string): Promise<void>;
    disconnectCard(cardId: string): Promise<void>;
    denyCard(cardId: string): Promise<void>;
    ignoreCard(cardId: string): Promise<void>;
    resyncCard(cardId: string): Promise<void>;
    flagCard(cardId: string): Promise<void>;
    setBlockedCard(cardId: string, blocked: boolean): Promise<void>;
    getRegistry(handle: string | null, server: string | null): Promise<Profile[]>;
    callCard(cardId: string): Promise<Link>;
    addCardListener(ev: (cards: Card[]) => void): void;
    removeCardListener(ev: (cards: Card[]) => void): void;
}
interface Content {
    addChannel(sealed: boolean, type: string, subject: any, cardIds: string[]): Promise<string>;
    removeChannel(channelId: string): Promise<void>;
    setChannelSubject(channelId: string, type: string, subject: any): Promise<void>;
    setChannelCard(channelId: string, cardId: string): Promise<void>;
    clearChannelCard(channelId: string, cardId: string): Promise<void>;
    leaveChannel(cardId: string, channelId: string): Promise<void>;
    getChannelNotifications(cardId: string | null, channelId: string): Promise<boolean>;
    setChannelNotifications(cardId: string | null, channelId: string, enabled: boolean): Promise<void>;
    setUnreadChannel(cardId: string | null, channelId: string, unread: boolean): Promise<void>;
    flagChannel(cardId: string | null, channelId: string): Promise<void>;
    setBlockedChannel(cardId: string | null, channelId: string, blocked: boolean): Promise<void>;
    clearBlockedChannelTopic(cardId: string | null, channelId: string, topicId: string): Promise<void>;
    addChannelListener(ev: (arg: {
        channels: Channel[];
        cardId: string | null;
    }) => void): void;
    removeChannelListener(ev: (arg: {
        channels: Channel[];
        cardId: string | null;
    }) => void): void;
    addLoadedListener(ev: (loaded: boolean) => void): void;
    removeLoadedListener(ev: (loaded: boolean) => void): void;
}
interface Alias {
    addGroup(sealed: boolean, type: string, subject: string, cardIds: string[]): Promise<string>;
    removeGroup(groupId: string): Promise<void>;
    setGroupSubject(groupId: string, subject: string): Promise<void>;
    setGroupCard(groupId: string, cardId: string): Promise<void>;
    clearGroupCard(groupId: string, cardId: string): Promise<void>;
    compare(groupIds: string[], cardIds: string[]): Promise<Map<string, string[]>>;
    addGroupListener(ev: (groups: Group[]) => void): void;
    removeGroupListener(ev: (groups: Group[]) => void): void;
}
interface Attribute {
    addArticle(sealed: boolean, type: string, subject: string, cardIds: string[], groupIds: string[]): Promise<string>;
    removeArticle(articleId: string): Promise<void>;
    setArticleSubject(articleId: string, subject: string): Promise<void>;
    setArticleCard(articleId: string, cardId: string): Promise<void>;
    clearArticleCard(articleId: string, cardId: string): Promise<void>;
    setArticleGroup(articleId: string, groupId: string): Promise<void>;
    clearArticleGroup(articleId: string, groupId: string): Promise<void>;
    addArticleListener(ev: (articles: Article[]) => void): void;
    removeArticleListener(ev: (articles: Article[]) => void): void;
}
interface Focus {
    getFocused(): {
        cardId: null | string;
        channelId: string;
    };
    addTopic(sealed: boolean, type: string, subject: (assets: {
        assetId: string;
        appId: string;
    }[]) => any, assets: AssetSource[], progress: (percent: number) => boolean): Promise<string>;
    setTopicSubject(topicId: string, type: string, subject: (assets: {
        assetId: string;
        appId: string;
    }[]) => any, files: AssetSource[], progress: (percent: number) => boolean): Promise<void>;
    removeTopic(topicId: string): Promise<void>;
    viewMoreTopics(): Promise<void>;
    getTopicAssetUrl(topicId: string, assetId: string, progress?: (percent: number) => boolean | void): Promise<string>;
    flagTopic(topicId: string): Promise<void>;
    setBlockTopic(topicId: string): Promise<void>;
    clearBlockTopic(topicId: string): Promise<void>;
    markTopicRead(topicId: string): Promise<void>;
    getTopicReadReceipts(topicId: string): Promise<{
        guid: string;
        readTime: number;
        name?: string;
        handle?: string;
        imageUrl?: string;
    }[]>;
    addTopicListener(ev: (topics: null | Topic[]) => void): void;
    removeTopicListener(ev: (topics: null | Topic[]) => void): void;
    addOffsyncListener(ev: (offsync: boolean) => void): void;
    removeOffsyncListener(ev: (offsync: boolean) => void): void;
    addDetailListener(ev: (focused: {
        cardId: string | null;
        channelId: string;
        detail: FocusDetail | null;
    }) => void): void;
    removeDetailListener(ev: (focused: {
        cardId: string | null;
        channelId: string;
        detail: FocusDetail | null;
    }) => void): void;
}
interface Service {
    getMembers(): Promise<Member[]>;
    createMemberAccess(): Promise<string>;
    resetMemberAccess(accontId: number): Promise<string>;
    blockMember(accountId: number, flag: boolean): Promise<void>;
    removeMember(accountId: number): Promise<void>;
    getSetup(): Promise<Setup>;
    setSetup(setup: Setup): Promise<void>;
    checkMFAuth(): Promise<boolean>;
    enableMFAuth(): Promise<{
        image: string;
        text: string;
    }>;
    confirmMFAuth(code: string): Promise<void>;
    disableMFAuth(): Promise<void>;
}
interface Contributor {
    addTopic(type: string, message: string, assets: Asset[]): Promise<string>;
    removeTopic(topicId: string): Promise<void>;
    addTag(topicId: string, type: string, value: string): Promise<string>;
    removeTag(topicId: string, tagId: string): Promise<void>;
}

interface Crypto {
    pbkdfSalt(): Promise<{
        saltHex: string;
    }>;
    pbkdfKey(saltHex: string, password: string): Promise<{
        aesKeyHex: string;
    }>;
    aesKey(): Promise<{
        aesKeyHex: string;
    }>;
    aesIv(): Promise<{
        ivHex: string;
    }>;
    aesEncrypt(data: string, ivHex: string, aesKeyHex: string): Promise<{
        encryptedDataB64: string;
    }>;
    aesDecrypt(encryptedDataB64: string, ivHex: string, aesKeyHex: string): Promise<{
        data: string;
    }>;
    rsaKey(): Promise<{
        publicKeyB64: string;
        privateKeyB64: string;
    }>;
    rsaEncrypt(data: string, publicKeyB64: string): Promise<{
        encryptedDataB64: string;
    }>;
    rsaDecrypt(encryptedDataB64: string, privateKeyB64: string): Promise<{
        data: string;
    }>;
}

interface Staging {
    clear(): Promise<void>;
    read(source: any): Promise<{
        size: number;
        getData: (position: number, length: number) => Promise<string>;
        close: () => Promise<void>;
    }>;
    write(): Promise<{
        setData: (data: string) => Promise<void>;
        getUrl: () => Promise<string>;
        close: () => Promise<void>;
    }>;
}

interface SqlStore {
    set(stmt: string, params?: (string | number | null)[]): Promise<void>;
    get(stmt: string, params?: (string | number | null)[]): Promise<any[]>;
}
interface WebStore {
    getValue(key: string): Promise<string>;
    setValue(key: string, value: string): Promise<void>;
    clearValue(key: string): Promise<void>;
    clearAll(): Promise<void>;
}

declare class DatabagSDK {
    private log;
    private crypto;
    private staging;
    private store;
    private params;
    constructor(params: Params, crypto?: Crypto, staging?: Staging, log?: Logging);
    initOfflineStore(sql: SqlStore): Promise<Session | null>;
    initOnlineStore(web: WebStore): Promise<Session | null>;
    available(node: string, secure: boolean): Promise<number>;
    username(name: string, token: string, node: string, secure: boolean): Promise<boolean>;
    login(handle: string, password: string, node: string, secure: boolean, mfaCode: string | null, params: SessionParams): Promise<Session>;
    access(node: string, secure: boolean, token: string, params: SessionParams): Promise<Session>;
    create(handle: string, password: string, node: string, secure: boolean, token: string | null, params: SessionParams): Promise<Session>;
    remove(session: Session): Promise<void>;
    logout(session: Session, all: boolean): Promise<void>;
    configure(node: string, secure: boolean, token: string, mfaCode: string | null): Promise<Service>;
    automate(node: string, secure: boolean, token: string): Promise<Contributor>;
}

export { type Activity, type Alias, type Article, type Asset, type AssetSource, AssetType, type Attribute, type Call, type Card, type Channel, type Config, type Contact, type Content, type Contributor, type Crypto, DatabagSDK, type Focus, type FocusDetail, type Group, HostingMode, ICEService, type Identity, KeyType, type Link, type Member, type Membership, type Params, type Participant, type Profile, type PushParams, PushType, type ReadReceipt, type Revision, type Ring, type Service, type Session, type SessionParams, type Settings, type Setup, type SqlStore, type Staging, type Tag, type Topic, TransformType, type WebStore };
