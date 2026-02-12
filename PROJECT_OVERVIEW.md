# Databag 项目功能说明文档

## 项目概述

**Databag** 是一个去中心化的联邦通信系统，专为自托管而设计的轻量级即时通讯应用。采用去中心化架构，支持端到端加密，可在资源受限的设备（如树莓派 Zero v1.3）上运行。

### 核心特性
- **去中心化**：应用与服务器节点直接通信
- **联邦式**：不同节点上的账户可以互相通信
- **基于公私钥的身份**：不绑定任何区块链或托管域名
- **端到端加密**：托管管理员无法查看已密封的内容
- **音视频通话**：支持 NAT 穿透（需要独立的中继服务器）
- **基于主题的线程**：消息按主题组织而非按联系人
- **轻量级设计**：可在树莓派 Zero v1.3 上运行
- **低延迟**：使用 WebSocket 推送事件，避免轮询
- **多账户支持**：每个节点支持无限账户
- **移动端通知**：支持 UnifiedPush、FCM、APN
- **多因素认证**：集成 TOTP 应用

---

## 项目架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
├──────────────────┬──────────────────┬───────────────────────┤
│   Web 客户端      │   移动端客户端    │      Bot 客户端      │
│  (React+TS)      │  (React Native)  │     (TypeScript)     │
├──────────────────┴──────────────────┴───────────────────────┤
│                        SDK 层                               │
│                 (databag-client-sdk)                        │
├─────────────────────────────────────────────────────────────┤
│                        网络层                                │
├──────────────────┬──────────────────┬───────────────────────┤
│    REST API      │    WebSocket     │   管理界面 (旧版)     │
│   (Go Server)    │   (Go Bridge)    │   (React+AntD)       │
├──────────────────┴──────────────────┴───────────────────────┤
│                        数据层                                │
│              (SQLite + Media Transform)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 模块详细说明

### 1. 后端服务（net/server）

**技术栈**：Go 语言 + GORM + SQLite

**主要功能**：

#### 账户管理
- 账户创建、登录、认证
- 多因素认证（MFA/TOTP）
- 访问令牌管理
- 密码策略配置
- 登录失败锁定

#### 联系人管理
- 添加/删除联系人
- 连接状态管理
- 联系人卡片交换
- 联系人权限管理

#### 频道管理
- 创建/更新/删除频道
- 频道权限控制
- 频道成员管理
- 频道密封（端到端加密）

#### 消息管理
- 发送/接收消息
- 消息附件处理
- 主题和评论管理
- 消息读取状态

#### 管理员功能
- 节点配置管理
- 联邦主机配置
- 用户账户管理
- 存储配额管理
- IP 封禁和速率限制

#### 安全功能
- IP 封禁机制
- 速率限制
- 自动清理调度器
- WebRTC ICE 配置

#### API 端点（140+ 个）

**账户相关**：
```
POST   /account/create          # 创建账户
POST   /account/login           # 登录
DELETE /account/logout          # 登出
GET    /account/profile         # 获取资料
PUT    /account/profile         # 更新资料
```

**联系人相关**：
```
GET    /contact/cards           # 获取联系人列表
POST   /contact/add             # 添加联系人
DELETE /contact/remove          # 删除联系人
PUT    /contact/connect         # 连接联系人
PUT    /contact/approveConnect  # 批准连接
```

**频道相关**：
```
GET    /content/channels        # 获取频道列表
POST   /content/channel         # 创建频道
PUT    /content/channel         # 更新频道
DELETE /content/channel         # 删除频道
GET    /content/topics          # 获取主题列表
POST   /content/topic           # 发布主题
```

**消息相关**：
```
GET    /content/comments        # 获取评论列表
POST   /content/comment         # 发布评论
GET    /content/topicsUnsealed  # 获取未密封主题
POST   /content/sealTopic       # 密封主题
```

**管理员相关**：
```
GET    /admin/status            # 获取节点状态
PUT    /admin/status            # 设置节点配置
PUT    /admin/access            # 获取管理员令牌
GET    /admin/mfauth            # 检查 MFA 状态
POST   /admin/mfauth            # 启用 MFA
GET    /admin/accounts          # 获取账户列表
POST   /admin/accounts          # 创建账户令牌
```

**WebSocket 端点**：
```
GET    /status                  # WebSocket 事件推送
GET    /status/activity         # 通话事件推送
```

---

### 2. Web 管理界面（net/web）

**技术栈**：React 18 + Ant Design 5 + TypeScript + React Router

**定位**：**旧版服务器管理界面**，主要用于：
- 服务器初始化配置
- 管理员账户管理
- 仪表板监控
- 访问控制管理

**主要功能**：
- 节点状态查看
- 管理员登录（支持 MFA）
- 会话管理
- 访问令牌生成
- 账户链接生成

**路由结构**：
```
/                  # 根页面
/dashboard         # 管理仪表板
/admin             # 管理员访问
/login             # 登录页面
/create            # 创建账户
/session           # 会话管理
```

**注意**：这是一个**管理后台**，不是终端用户的聊天应用。

---

### 3. Web 客户端（app/client/web）

**技术栈**：React 18 + TypeScript + Vite + Mantine UI 7

**定位**：**新版 Web 聊天客户端**，面向终端用户的即时通讯应用

**主要功能**：

#### 认证与访问
- 账户注册/登录
- 账户切换
- 服务器连接
- 登录状态管理

#### 账户管理
- 个人资料编辑
- 头像上传
- 状态设置
- 主题切换

#### 联系人功能
- 添加联系人（通过链接或服务器搜索）
- 联系人列表管理
- 连接请求处理
- 联系人详情查看

#### 频道/对话
- 创建 1:1 对话
- 创建群组频道
- 频道成员管理
- 频道设置（名称、主题、图片）
- 密封频道（端到端加密）

#### 消息功能
- 发送文本消息
- 发送图片/视频/文件
- 话题讨论
- 消息回复
- 消息搜索
- 消息编辑

#### 通话功能
- 音频通话
- 视频通话
- 通话状态管理
- 音视频设备选择

#### 通知功能
- 实时消息通知
- 通话通知
- 连接请求通知

#### 界面特性
- 响应式设计
- 虚拟滚动（优化大列表性能）
- 深色/浅色主题
- 多语言支持

**目录结构**：
```
src/
├── access/          # 访问/登录
├── accounts/        # 账户管理
├── admin/           # 管理员设置
├── api/             # API 调用封装
├── base/            # 基础组件
├── call/            # 通话相关
├── calling/         # 通话状态管理
├── card/            # 联系人卡片
├── channel/         # 频道管理
├── contacts/        # 联系人管理
├── conversation/    # 对话界面
├── content/         # 内容管理
├── context/         # React Context
├── details/         # 详情页面
├── hooks/           # 自定义 Hooks
├── identity/        # 身份管理
├── message/         # 消息组件
├── profile/         # 用户资料
├── registry/        # 注册表
├── ring/            # 呼叫管理
├── root/            # 根组件
├── service/         # 服务管理
├── session/         # 会话管理
├── settings/        # 设置
└── utils/           # 工具函数
```

**开发命令**：
```bash
npm run dev          # 开发服务器（端口 3000）
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 检查
npm run test         # Vitest 测试
```

---

### 4. 移动端客户端（app/client/mobile）

**技术栈**：React Native 0.75 + TypeScript + React Navigation

**支持平台**：Android / iOS

**主要功能**：

#### 账户与认证
- 账户注册/登录
- 多账户管理
- 账户切换
- 生物识别登录（可选）

#### 联系人
- 添加联系人
- 联系人列表
- 连接请求
- 联系人详情

#### 聊天功能
- 1:1 对话
- 群组频道
- 文本/图片/视频/文件消息
- 消息回复
- 消息转发
- 消息删除
- 消息编辑

#### 通话功能
- 音频通话
- 视频通话
- 通话记录
- 音视频设备控制
- 后台通话支持

#### 推送通知
- UnifiedPush 支持
- FCM（Firebase Cloud Messaging）
- APN（Apple Push Notification）
- 通知声音配置

#### 媒体功能
- 图片/视频选择
- 相机拍照
- 文件选择
- 媒体预览

#### 离线支持
- 本地 SQLite 存储
- 离线消息队列
- 自动同步

**目录结构**：
```
src/
├── access/          # 访问控制
├── accounts/        # 账户功能
├── base/            # 基础组件
├── call/            # 通话
├── card/            # 联系人
├── channel/         # 频道
├── conversation/    # 对话
├── message/         # 消息
├── profile/         # 资料
├── session/         # 会话
├── context/         # Context
├── constants/       # 常量
├── utils/           # 工具
├── components/      # 组件
└── types/           # 类型定义

android/             # Android 原生代码
ios/                 # iOS 原生代码
```

**运行命令**：
```bash
npm run android      # 运行 Android
npm run ios          # 运行 iOS
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化
npm run test         # Jest 测试
```

---

### 5. Bot 客户端（app/client/bot）

**技术栈**：Node.js + TypeScript

**功能**：
- 展示如何使用 Databag SDK 开发自动化 Bot
- 自动响应消息
- 自动添加联系人
- 自动创建频道
- 自动发布内容

**运行命令**：
```bash
npm run start:dev    # 使用 nodemon 自动重载
npm run start        # 构建并运行
npm run build        # TypeScript 编译
```

---

### 6. SDK（app/sdk）

**技术栈**：TypeScript + EventEmitter3

**功能**：提供与 Databag 网络通信的完整接口

#### 核心模块

**Session 接口** - 账户通信
```typescript
getSettings()      // 获取账户设置
getIdentity()      // 获取账户资料
getContact()       // 联系人管理
getContent()       // 内容（频道）管理
getRing()          // WebRTC 通话
setFocus()         // 激活频道
```

**Service 接口** - 管理员通信
```typescript
getMembers()       // 获取账户列表
getSetup()         // 服务器配置
createMemberAccess()  // 创建账户令牌
resetMemberAccess()  // 重置访问令牌
```

#### 主要类

1. **DatabagSDK** - 主入口类
2. **Session** - 会话管理
3. **Contact** - 联系人管理
4. **Content** - 内容管理
5. **Channel** - 频道管理
4. **Ring** - 通话管理
5. **Store** - 存储（SQL/Web）
6. **Crypto** - 加密接口

#### 存储支持
- **Web 存储**：使用 IndexedDB
- **SQL 存储**：使用 SQLite（移动端）

**构建命令**：
```bash
npm run build        # 使用 tsup 构建
npm run format       # Prettier 格式化
npm run test         # Jest 测试
```

---

### 7. 中继服务器（net/repeater）

**技术栈**：Go 语言

**功能**：
- 提供 STUN/TURN 中继服务
- 用于 WebRTC NAT 穿透
- 支持音视频通话

**配置**：
```yaml
# 在管理界面配置 WebRTC：
WebRTC Server URL: turn:server:port?transport=udp
WebRTC Username: username
WebRTC Password: password
```

---

### 8. 媒体转换服务（net/transform）

**功能**：
- 图片缩略图生成
- 视频转码（高清/标清/低质量）
- 音频处理
- 媒体格式转换

**支持的脚本**：
```
transform_acopy.sh    # 音频复制
transform_icopy.sh    # 图片复制
transform_ilg.sh      # 图片高质量
transform_ithumb.sh   # 图片缩略图
transform_vcopy.sh    # 视频复制
transform_vhd.sh      # 视频高清
transform_vlq.sh      # 视频低质量
transform_vsd.sh      # 视频标准质量
transform_vthumb.sh   # 视频缩略图
```

---

## 数据模型

### 核心数据结构

1. **Profile** - 描述账户持有人，可公开共享
2. **Card** - 网络中其他账户的引用
3. **Alias** - 卡片列表，便于共享
4. **Channel** - 与别名和卡片列表共享的数据集合
5. **Topic** - 与频道关联的数据
6. **Comment** - 与主题关联的数据
7. **Attribute** - 账户持有人发布并与别名列表共享的数据

### 版本控制机制

所有数据对象维护版本号，用于高效同步：
- 新数据发布时，版本号递增
- 客户端根据版本号拉取更新
- 删除数据通过空值标记

---

## 通信流程

### 基本通信流程

```
用户A 发布消息 → 用户A的节点 → 用户B的节点 → 用户B的客户端拉取
     (1)            (2) REST       (3) 通知      (4) REST
```

详细步骤：
1. 用户 A 的客户端通过 REST API 将数据发送到用户 A 的节点
2. 用户 A 的节点通过通知端点通知用户 B 的节点
3. 用户 B 的节点通过 WebSocket 连接通知用户 B 的客户端
4. 用户 B 的客户端通过 REST API 从用户 A 的节点拉取新数据

### 端到端加密流程

1. 客户端生成公/私钥对（密封密钥）
2. 公钥作为账户资料的一部分发布
3. 每个频道使用对称密钥独立加密
4. 频道对象包含使用各参与账户公钥加密的对称密钥列表
5. 客户端使用自己的私钥解密对称密钥，然后解密频道内容

---

## 关键区别说明

### net/web vs app/client/web

| 特性 | net/web | app/client/web |
|------|---------|----------------|
| **定位** | 管理后台 | 终端用户聊天应用 |
| **用途** | 服务器管理、账户创建 | 即时通讯、聊天 |
| **UI 库** | Ant Design | Mantine UI |
| **路由** | /admin, /dashboard, /login | /, /session, /conversation |
| **目标用户** | 管理员 | 普通用户 |
| **功能** | 配置、监控、管理 | 聊天、通话、分享 |
| **状态** | 旧版（仍在使用） | 新版（主要客户端） |

### app/mobile vs app/client/mobile

- `app/mobile` - 可能是旧版本或备份目录
- `app/client/mobile` - 当前使用的移动端应用

---

## 部署架构

### Docker Compose 部署

```yaml
services:
  databag:
    image: balzack/databag:latest
    ports:
      - "7000:7000"
    environment:
      - ADMIN=admin_password
      - DATABAG_WS_ORIGIN_STRICT: 0
    volumes:
      - databag-data:/var/lib/databag

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

### 支持的部署方式

1. **Docker Compose** - 标准部署
2. **Portainer + Nginx Proxy Manager** - 可视化管理
3. **nginx-proxy** - 自动 SSL 证书
4. **树莓派 Zero** - 轻量级部署
5. **AWS** - 云端部署
6. **OpenWrt** - 路由器集成
7. **1-Click 部署** - CapRover, CasaOS, Unraid, Umbrel 等

---

## 环境变量配置

### 服务器配置

```bash
ADMIN=password                          # 管理员密码
DATABAG_WS_ORIGIN_STRICT=0             # WebSocket 严格模式
DATABAG_LOGIN_FAIL_PERIOD=300          # 登录失败锁定时间（秒）
DATABAG_LOGIN_FAIL_COUNT=5             # 登录失败次数阈值
DATABAG_PASSWORD_MIN_LENGTH=8           # 密码最小长度
DATABAG_PASSWORD_REQUIRE_UPPER=true     # 要求大写字母
DATABAG_IP_BLOCK_THRESHOLD=5            # IP 封禁阈值
```

### WebRTC 配置

```bash
ENABLE_WEBRTC=true                     # 启用 WebRTC
WEBRTC_SERVER_URL=turn:server:3478      # TURN 服务器地址
WEBRTC_USERNAME=username               # 用户名
WEBRTC_PASSWORD=password               # 密码
```

---

## 未来功能规划（Backlog）

### 即将推出
- Web 应用内存优化（使用文件系统 API）
- 消息通知内容配置
- 群组通话支持
- 直接支持 STUN/TURN 中继

### 规划中
- CLI 自动化客户端
- Bot 支持
- 单点登录（SSO）
- 音视频消息
- 截屏和拍照发送
- 后置摄像头通话
- 屏幕共享
- 画中画（PiP）
- 账户迁移工具
- 已读回执
- 消息反应和回复
- 图片压缩选项
- PostgreSQL 数据库支持
- 相册分享和评论
- 桌面客户端
- 模块化嵌入
- iOS APN 直接支持
- 密码恢复
- 自动归档

---

## 安全特性

1. **端到端加密**
   - 客户端生成密钥对
   - 服务端无法查看加密内容
   - 每个频道独立加密

2. **身份验证**
   - 基于公私钥的身份
   - MFA/TOTP 支持
   - 访问令牌管理

3. **防护机制**
   - IP 封禁
   - 速率限制
   - 登录失败锁定
   - 密码策略

---

## 技术栈总结

| 组件 | 技术栈 |
|------|--------|
| 后端服务 | Go + GORM + SQLite |
| Web 管理界面 | React 18 + Ant Design + TypeScript |
| Web 客户端 | React 18 + TypeScript + Vite + Mantine |
| 移动端 | React Native 0.75 + TypeScript |
| SDK | TypeScript + EventEmitter3 |
| 中继服务 | Go |
| 部署 | Docker + Docker Compose + Nginx |

---

## 总结

Databag 是一个完整的去中心化即时通讯系统，包含：
- ✅ 后端服务（Go）
- ✅ Web 管理界面（React + AntD）
- ✅ Web 客户端（React + Mantine）
- ✅ 移动端客户端（React Native）
- ✅ Bot 客户端（Node.js + TypeScript）
- ✅ SDK（TypeScript）
- ✅ 中继服务（Go）
- ✅ 部署配置（Docker）

**设计理念**：
- 轻量级、高效
- 去中心化、联邦式
- 端到端加密
- 自托管友好
- 跨平台支持
