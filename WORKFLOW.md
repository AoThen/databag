# Databag 使用与开发流程文档

## 目录
- [用户使用流程](#用户使用流程)
- [开发者入门流程](#开发者入门流程)
- [部署流程](#部署流程)
- [架构通信流程](#架构通信流程)
- [开发工作流](#开发工作流)

---

## 用户使用流程

### 1. 部署服务器

#### 方法一：使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/balzack/databag.git
cd databag

# 2. 配置环境变量
# 编辑 deploy/docker-compose.yml，设置管理员密码
ADMIN: your_secure_password

# 3. 启动服务
docker-compose up -d

# 4. 检查服务状态
docker-compose ps
```

#### 方法二：使用 Portainer

1. 在 Portainer 中创建 Volume：`databag-data`
2. 创建容器，配置如下：
   - Image: `balzack/databag:latest`
   - 端口: `7000:7000`
   - 环境变量:
     ```
     ADMIN: your_password
     ```
   - Volume: `/var/lib/databag` -> `databag-data`
3. 部署容器

#### 方法三：使用 nginx-proxy（自动 SSL）

```bash
# 使用示例配置
cd examples/docker-nginx-proxy
docker-compose up -d
```

---

### 2. 配置服务器

#### 访问管理界面

```
1. 在浏览器中访问服务器地址
   http://your-server-domain.com

2. 点击右上角齿轮图标
   输入管理员密码（环境变量 ADMIN）

3. 进入设置页面
   配置以下内容：
   - Federated Host: your-server-domain.com
   - 点击保存
```

#### 配置 WebRTC（可选）

```
在管理设置中：
1. 启用 WebRTC Calls: 开启
2. WebRTC Server URL: turn:server:3478?transport=udp
   - 使用 coturn: turn:your-turn-server.com:3478?transport=udp
   - 使用 Cloudflare: turn:global.turn.twilio.com:3478?transport=udp
3. WebRTC Username: your_username
4. WebRTC Password: your_password
5. 点击保存
```

#### 配置多因素认证（可选）

```
1. 在管理界面点击 MFA 设置
2. 扫描 QR 码添加到 TOTP 应用（如 Google Authenticator）
3. 输入验证码确认
4. 保存配置
```

---

### 3. 创建账户

```
1. 在管理界面点击用户图标
2. 点击 "Generate Account Link"
3. 复制生成的链接
4. 在浏览器中打开链接
5. 填写账户信息：
   - Username: 用户名
   - Full Name: 全名
   - Password: 密码
   - Confirm Password: 确认密码
6. 点击 "Create Account"
```

---

### 4. 使用 Web 客户端

#### 登录

```
1. 访问服务器地址
   http://your-server-domain.com

2. 点击 "Login"
3. 输入用户名和密码
4. 点击登录
```

#### 添加联系人

```
方法一：通过服务器搜索
1. 点击 "+" 按钮或 "Add Contact"
2. 输入服务器地址
3. 选择用户
4. 发送连接请求

方法二：通过链接
1. 从联系人处获取账户链接
2. 在浏览器中打开链接
3. 点击 "Connect"
```

#### 创建频道

```
1. 点击 "+" 按钮
2. 选择 "Create Channel"
3. 输入频道名称和主题
4. 选择频道类型：
   - Conversation: 1:1 对话
   - Group Channel: 群组频道
5. 选择成员
6. 点击创建
```

#### 发送消息

```
1. 选择频道
2. 输入消息内容
3. 点击发送按钮（或按 Enter）
4. 可附加图片、视频或文件
```

#### 语音/视频通话

```
1. 打开与联系人的对话
2. 点击视频或电话图标
3. 等待对方接受
4. 通话中可切换摄像头、静音等
```

---

### 5. 使用移动端客户端

#### 安装应用

```
从以下渠道下载：
- Google Play: https://play.google.com/store/apps/details?id=com.databag
- Apple App Store: https://apps.apple.com/us/app/databag/id6443741428
- F-Droid: https://f-droid.org/en/packages/com.databag/
```

#### 配置账户

```
1. 打开应用
2. 输入服务器地址
   例如: https://your-server-domain.com
3. 点击 "Connect"
4. 输入用户名和密码
5. 点击 "Login"
```

#### 使用功能

```
- 查看/添加联系人
- 发送/接收消息
- 发送图片、视频、文件
- 语音/视频通话
- 管理频道
- 设置通知
```

---

## 开发者入门流程

### 1. 环境准备

#### 安装依赖

```bash
# Node.js (推荐 v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Go (推荐 v1.21+)
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose

# Git
sudo apt-get install git
```

#### 克隆项目

```bash
git clone https://github.com/balzack/databag.git
cd databag
```

---

### 2. 后端开发

#### 运行后端服务

```bash
# 进入服务器目录
cd net/server

# 安装依赖
go mod download

# 运行服务
go run main.go \
  -s /var/lib/databag \      # 存储路径
  -w ../web/build \          # Web 应用路径
  -p 7000 \                   # 端口
  -c /path/to/cert.pem \      # SSL 证书（可选）
  -k /path/to/key.pem        # SSL 私钥（可选）
```

#### 后端开发命令

```bash
# 构建后端
go build -o databag-server main.go

# 运行测试
go test ./...

# 代码格式化
go fmt ./...

# 静态检查
go vet ./...
```

#### 后端项目结构

```
net/server/
├── internal/
│   ├── api_*.go              # API 端点（140+ 个文件）
│   ├── appValues.go          # 应用配置值
│   ├── authUtil.go           # 认证工具
│   ├── bridge.go             # WebSocket 桥接
│   ├── cleanupScheduler.go   # 自动清理
│   ├── configUtil.go         # 配置工具
│   ├── garbageUtil.go        # 垃圾回收
│   ├── httpUtil.go           # HTTP 工具
│   ├── iceUtil.go            # WebRTC ICE
│   ├── ipBlockUtil.go        # IP 封禁工具
│   ├── keyUtil.go            # 密钥工具
│   ├── logger.go             # 日志
│   ├── loginConfig.go        # 登录配置
│   ├── messageUtil.go        # 消息工具
│   ├── models.go             # 数据模型
│   ├── modelUtil.go          # 模型工具
│   ├── notify.go             # 通知
│   ├── passwordUtil.go       # 密码工具
│   ├── routers.go            # 路由
│   └── store/                # 数据存储
├── main.go                   # 主程序入口
└── entrypoint.sh             # Docker 入口脚本
```

---

### 3. Web 客户端开发

#### 开发 Web 客户端（app/client/web）

```bash
# 进入 Web 客户端目录
cd app/client/web

# 安装依赖
npm install

# 启动开发服务器
npm run dev          # 运行在 http://localhost:3000

# 类型检查
npm run type-check

# Lint 检查
npm run lint

# 运行测试
npm run test

# 生产构建
npm run build

# 预览生产构建
npm run preview      # 运行在 http://localhost:8080
```

#### Web 客户端开发流程

```
1. 查看现有组件
   src/base/        # 基础组件
   src/card/        # 联系人组件
   src/channel/     # 频道组件
   src/message/     # 消息组件

2. 创建新组件
   src/components/YourComponent.tsx

3. 使用自定义 Hooks
   src/hooks/yourHook.hook.ts

4. 添加 Context（如果需要）
   src/context/YourContext.tsx

5. 更新路由
   src/App.tsx

6. 运行类型检查和 Lint
   npm run type-check
   npm run lint
```

---

### 4. 移动端开发

#### 开发移动端（app/client/mobile）

```bash
# 进入移动端目录
cd app/client/mobile

# 安装依赖
npm install

# iOS 开发
npm run ios          # 需要 macOS 和 Xcode

# Android 开发
npm run android      # 需要 Android Studio

# Lint
npm run lint

# 格式化
npm run format

# 运行测试
npm run test
```

#### 移动端开发环境配置

**Android**:
```bash
# 安装 Android Studio
# 设置 ANDROID_HOME 环境变量
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 创建虚拟设备（可选）
```

**iOS**:
```bash
# 安装 Xcode
# 安装 CocoaPods
sudo gem install cocoapods

# 安装 iOS 依赖
cd ios && pod install
```

---

### 5. SDK 开发

#### 开发 SDK（app/sdk）

```bash
# 进入 SDK 目录
cd app/sdk

# 安装依赖
npm install

# 构建 SDK
npm run build        # 生成 dist 目录

# 格式化代码
npm run format

# 运行测试
npm run test
```

#### SDK 使用示例

```typescript
import { DatabagSDK } from 'databag-client-sdk'

// 初始化 SDK
const sdk = new DatabagSDK({
  serviceUrl: 'https://your-server.com',
  enableLogs: true,
})

// 登录
const session = await sdk.login(username, password)

// 获取联系人
const contact = await session.getContact()

// 添加联系人
await contact.addCard('server-domain', 'token')

// 获取频道
const content = await session.getContent()
const channels = await content.getChannels()

// 创建频道
const channel = await content.addChannel({
  subject: 'My Channel',
  cardIds: ['card-id'],
})

// 发送消息
await channel.addTopic({
  dataType: 'superbasictopic',
  data: { text: 'Hello, World!' },
})

// 通话
const ring = await session.getRing()
await ring.call(cardId)
```

---

### 6. Bot 开发

#### 开发 Bot（app/client/bot）

```bash
# 进入 Bot 目录
cd app/client/bot

# 安装依赖
npm install

# 开发模式（自动重载）
npm run start:dev

# 构建并运行
npm run start

# 构建
npm run build
```

#### Bot 示例代码

```typescript
import { DatabagSDK } from 'databag-client-sdk'

async function main() {
  // 初始化 SDK
  const sdk = new DatabagSDK({
    serviceUrl: 'https://your-server.com',
  })

  // 登录
  const session = await sdk.login('bot-username', 'password')

  // 监听新消息
  const content = await session.getContent()
  const channels = await content.getChannels()

  channels.forEach(channel => {
    channel.addTopicListener(async (topic) => {
      console.log('收到消息:', topic.data.text)

      // 自动回复
      if (topic.data.text === 'hello') {
        await channel.addTopic({
          dataType: 'superbasictopic',
          data: { text: 'Hi there! I am a bot.' },
        })
      }
    })
  })

  console.log('Bot 已启动')
}

main()
```

---

## 部署流程

### 1. 开发环境部署

```bash
# 使用 Docker Compose
cd deploy
docker-compose -f docker-compose.yml -p databag up

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 2. 生产环境部署

#### 准备 SSL 证书

```bash
# 使用 Certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 证书位置
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

#### 配置 Nginx

```nginx
server {
  server_name your-domain.com;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_pass http://127.0.0.1:7000;
    client_max_body_size 0;
    proxy_max_temp_file_size 0;
  }

  listen 443 ssl http2;
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

  listen 80;
  server_name your-domain.com;
  return 301 https://$host$request_uri;
}
```

#### 启动服务

```bash
# 使用 docker-compose
docker-compose -f deploy/docker-compose.yml -p databag up -d

# 检查状态
docker-compose ps

# 查看日志
docker-compose logs -f databag
```

### 3. 云平台部署

#### AWS 部署

参考文档：`doc/aws.md`

#### 树莓派部署

参考文档：`doc/pizero.md`

#### OpenWrt 集成

参考文档：`doc/openwrt.md`

---

## 架构通信流程

### 1. 用户认证流程

```
┌─────────┐    1. POST /account/login    ┌─────────┐
│ Client  │ ────────────────────────────> │ Server  │
└─────────┘                              └─────────┘
    ▲                                          │
    │                                          │
    │  2. 返回 Token                           │
    │  (用于后续所有请求)                       │
    └──────────────────────────────────────────┘

带 MFA 的认证：
┌─────────┐    1. POST /account/login    ┌─────────┐
│ Client  │ ───────────────────────────> │ Server  │
└─────────┘                              └─────────┘
    ▲                                          │
    │                                          │
    │  2. 返回 "MFA required"                   │
    └──────────────────────────────────────────┘
                                                  │
┌─────────┐    3. 重新登录 + TOTP code  ┌─────────┐
│ Client  │ ───────────────────────────> │ Server  │
└─────────┘                              └─────────┘
    ▲                                          │
    │                                          │
    │  4. 返回 Token                           │
    └──────────────────────────────────────────┘
```

### 2. 消息发送流程

```
┌─────────┐    1. POST /content/topic    ┌─────────┐    2. 通知       ┌─────────┐
│ Client A│ ───────────────────────────> │Node A   │ ──────────────> │Node B   │
└─────────┘                              └─────────┘                 └─────────┘
                                                                      │
                                                                      │
                                            3. WebSocket push       │
                                            通知新消息               │
                                                ↓
                                              ┌─────────┐
                                              │Client B │
                                              └─────────┘
                                                  │
                                                  │ 4. GET /content/topics
                                                  │    拉取新消息
                                                  ↓
                                              ┌─────────┐
                                              │Node A   │
                                              └─────────┘
```

### 3. 联系人连接流程

```
┌─────────┐    1. 生成账户链接        ┌─────────┐
│ Admin   │ ───────────────────────> │ Server  │
└─────────┘                              └─────────┘
    ▲                                          │
    │                                          │
    │  2. 返回链接                             │
    │  https://domain.com/#/create/...        │
    └──────────────────────────────────────────┘

用户 B 打开链接：
┌─────────┐    3. 创建账户            ┌─────────┐
│ User B  │ ───────────────────────> │ Server  │
└─────────┘                              └─────────┘

用户 A 添加联系人：
┌─────────┐    4. PUT /contact/add   ┌─────────┐    5. 通知       ┌─────────┐
│ User A  │ ───────────────────────> │Node A   │ ──────────────> │Node B   │
└─────────┘                              └─────────┘                 └─────────┘
                                                                      │
                                                                      │
                                            6. WebSocket push       │
                                            通知连接请求             │
                                                ↓
                                              ┌─────────┐
                                              │User B   │
                                              └─────────┘
                                                  │
                                                  │ 7. PUT /contact/approveConnect
                                                  │    批准连接
                                                  ↓
                                              ┌─────────┐    8. 通知       ┌─────────┐
                                              │Node B   │ ──────────────> │Node A   │
                                              └─────────┘                 └─────────┘
```

### 4. WebRTC 通话流程

```
┌─────────┐                             ┌─────────┐
│User A   │                             │User B   │
└─────────┘                             └─────────┘
    │                                         │
    │ 1. POST /content/call                   │
    │    创建通话                             │
    ├───────────────────────────────────────> │
    │                                         │
    │ 2. WebSocket 通知                       │
    │    incoming call                        │
    │                                         │
    │                                         │ 3. 用户接受
    │                                         │
    │ 4. POST /content/call/approve           │
    │<───────────────────────────────────────┤
    │                                         │
    │ 5. WebRTC 连接建立（通过 STUN/TURN）    │
    │<=====================================> │
    │                                         │
    │ 6. 开始音视频通话                       │
    │                                         │
    │ 7. POST /content/call/end              │
    │    结束通话                             │
    ├───────────────────────────────────────> │
```

### 5. 端到端加密流程

```
┌─────────┐                             ┌─────────┐
│Client A │                             │Client B │
└─────────┘                             └─────────┘
    │                                         │
    │ 1. 生成密封密钥对 (Seal Key)            │
    │    公钥: Kpub_A, 私钥: Kpriv_A           │
    │                                         │
    │ 2. 发布公钥到 Profile                   │
    │                                         │
    │ 3. 创建频道，生成对称密钥 Ksym           │
    │                                         │
    │ 4. 使用 Kpub_A 加密 Ksym                │
    │    E_A = Encrypt(Kpub_A, Ksym)           │
    │                                         │
    │ 5. 使用 Kpub_B 加密 Ksym                │
    │    E_B = Encrypt(Kpub_B, Ksym)           │
    │                                         │
    │ 6. 加密消息                              │
    │    EncryptedMsg = Encrypt(Ksym, Msg)    │
    │                                         │
    │ 7. 发送: {EncryptedMsg, E_A, E_B}       │
    ├───────────────────────────────────────> │
    │                                         │
    │                                         │ 8. 使用 Kpriv_B 解密 E_B
    │                                         │    Ksym = Decrypt(Kpriv_B, E_B)
    │                                         │
    │                                         │ 9. 使用 Ksym 解密消息
    │                                         │    Msg = Decrypt(Ksym, EncryptedMsg)
```

---

## 开发工作流

### 1. 提交代码

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 进行开发
# ... 编写代码 ...

# 4. 运行测试和检查
# Web 客户端
cd app/client/web
npm run type-check
npm run lint
npm run test

# 移动端
cd app/client/mobile
npm run lint
npm run test

# SDK
cd app/sdk
npm run test

# 后端
cd net/server
go test ./...
go fmt ./...

# 5. 提交更改
git add .
git commit -m "feat: add new feature"

# 6. 推送到远程
git push origin feature/your-feature-name

# 7. 创建 Pull Request
# 在 GitHub 上创建 PR
```

### 2. 运行所有检查

```bash
# 根目录运行所有检查
npm run lint
npm run type-check
npm run test

# 或者单独运行
cd app/client/web && npm run lint
cd app/client/mobile && npm run lint
cd app/sdk && npm run test
cd net/server && go test ./...
```

### 3. 调试技巧

#### Web 客户端调试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中打开开发者工具
# - 查看网络请求
# - 查看控制台日志
# - 调试 React 组件

# 查看状态管理
# 在 React DevTools 中查看 Context 和 State
```

#### 移动端调试

```bash
# Android
npm run android

# 在 Chrome 中调试
# chrome://inspect

# iOS
npm run ios

# 在 Safari 中调试
# Safari -> Develop -> Simulator
```

#### 后端调试

```bash
# 启动服务并启用日志
go run main.go -s /tmp/databag -p 7000

# 查看日志
tail -f /tmp/databag/databag.log

# 使用 curl 测试 API
curl -X POST http://localhost:7000/account/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## 常见问题

### 1. 连接失败

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f databag

# 检查防火墙
sudo ufw status
sudo ufw allow 7000

# 检查 DNS
nslookup your-domain.com
```

### 2. WebSocket 连接失败

```bash
# 检查 WebSocket 配置
# 确保 WebSocket 严格模式关闭
DATABAG_WS_ORIGIN_STRICT=0

# 检查 Nginx 配置
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
```

### 3. 音视频通话失败

```bash
# 检查 TURN 服务器配置
# 在管理界面配置 WebRTC

# 测试 TURN 连接
# 使用 WebRTC 测试工具: https://webrtc.github.io/samples/
```

### 4. 推送通知不工作

```bash
# 检查推送配置
# 确保已配置 UnifiedPush/FCM/APN

# 移动端检查权限
# - 通知权限
# - 后台运行权限
```

---

## 参考资料

### 文档
- 项目概览: `PROJECT_OVERVIEW.md`
- 设计概览: `doc/design_overview.md`
- API 规范: `doc/api.oa3`
- 部署指南: `deploy/DEPLOYMENT.md`
- 升级指南: `UPGRADE.md`
- 安全登录: `SECURITY_LOGIN.md`

### 示例
- Docker 示例: `examples/docker-basic/`
- Nginx Proxy 示例: `examples/docker-nginx-proxy/`
- SSL 配置示例: `examples/docker-ssl/`

### 开发指南
- Agent 指南: `AGENTS.md`
- Figma 设计: https://www.figma.com/design/eVFi8bYlybn5KeyEePEaey/Databag---Github
