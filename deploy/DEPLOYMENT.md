# Databag 部署指南

## 目录

- [概述](#概述)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [SSL证书配置](#ssl证书配置)
- [WebSocket 安全配置](#websocket-安全配置)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [运维管理](#运维管理)
- [故障排查](#故障排查)
- [常见问题](#常见问题)

---

## 概述

Databag 是一个去中心化的即时通讯系统，支持自托管部署。

### 架构

```
┌─────────┐     HTTPS(443)      ┌─────────┐    HTTP(7000)     ┌─────────┐
│  客户端  │ ◄────────────────► │  Nginx  │ ◄──────────────── │  Server │
│ Browser │                    │  (SSL)  │                   │         │
└─────────┘                    └─────────┘                   └─────────┘
```

### 组件

| 组件 | 描述 | 端口 |
|-----|------|-----|
| Databag Server | 主服务 + Web UI | 7000 |
| Nginx | 反向代理 + SSL终结 | 80, 443 |

---

## 环境要求

### 服务器要求

| 配置 | 最低要求 | 推荐配置 |
|-----|---------|---------|
| CPU | 1核 | 2核+ |
| 内存 | 1GB | 2GB+ |
| 存储 | 10GB | 50GB+ SSD |
| 带宽 | 1Mbps | 10Mbps+ |

### 软件要求

- Docker 20.10+
- Docker Compose 2.0+
- 域名（已解析到服务器IP）
- SSL证书

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/databag.git
cd databag/deploy
```

### 2. 配置SSL证书

将SSL证书文件放入 `ssl/` 目录：

```bash
mkdir -p ssl
# 方式1: 使用 Let's Encrypt
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/

# 方式2: 使用已有证书
cp /path/to/your-cert.pem ssl/cert.pem
cp /path/to/your-key.pem ssl/key.pem
```

### 3. 配置docker-compose.yml

```bash
# 编辑 docker-compose.yml
# 修改以下配置项：
# - ADMIN: 设置管理员密码
# - DATABAG_ALLOWED_ORIGINS: 允许的域名（可选）
# - DATABAG_RATE_LIMIT: 速率限制（可选）
```

### 4. 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 访问应用

打开浏览器访问：`https://your-domain.com`

---

## 详细配置

### docker-compose.yml 配置说明

```yaml
services:
  app:
    image: ghcr.io/yourusername/databag:latest  # 或本地构建
    container_name: databag
    restart: unless-stopped
    ports:
      - "127.0.0.1:7000:7000"  # 只绑定本地端口
    volumes:
      - databag_data:/var/lib/databag  # 数据持久化
    environment:
      # ========== 必需配置 ==========
      - ADMIN=your-secure-password

      # ========== 可选配置 ==========
      - DEV=0                          # 0=生产模式, 1=开发模式
      - DATABAG_PORT=7000             # 服务端口

      # ========== 安全配置 ==========
      - DATABAG_ALLOWED_ORIGINS=      # 允许的域名，多个用逗号分隔
      - DATABAG_RATE_LIMIT=100        # 每分钟请求数限制

      # ========== WebSocket 安全配置 ==========
      - DATABAG_WS_ORIGIN_STRICT=1    # 0=禁用源验证(仅开发), 1=启用(生产)
      - DATABAG_WS_ALLOWED_ORIGINS=   # WebSocket来源白名单，逗号分隔

      # ========== 日志配置 ==========
      - LOG_LEVEL=info                # debug, info, warn, error
```

### Nginx 配置说明

```nginx
# 主要配置项说明
server {
    listen 443 ssl http2;
    
    # SSL证书路径
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # 上传大小限制
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://databag_server;  # 代理到Databag服务
        # WebSocket支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## WebSocket 安全配置

### 概述

Databag 使用 WebSocket 进行实时通信，包括状态同步、消息推送和 WebRTC 信令。为了防止跨站 WebSocket 劫持攻击，系统实现了严格的源（Origin）验证。

### 验证机制

WebSocket 连接会验证请求头中的 `Origin` 是否在允许列表中：

| 来源 | 处理 |
|-----|------|
| 空 Origin | 拒绝（除非 `DATABAG_WS_ORIGIN_STRICT=0`） |
| 匹配允许列表 | 允许连接 |
| 不匹配 | 拒绝连接 |

### 配置方式

#### 方式1：环境变量配置（推荐）

在 `docker-compose.yml` 中配置：

```yaml
services:
  app:
    environment:
      # ========== WebSocket 安全配置 ==========
      
      # 严格模式开关
      # 0 = 禁用源验证（仅用于开发调试）
      # 1 = 启用严格源验证（生产环境必须）
      - DATABAG_WS_ORIGIN_STRICT=1
      
      # WebSocket 来源白名单（逗号分隔）
      # 优先级高于数据库配置
      # - DATABAG_WS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

#### 方式2：数据库配置

通过管理 API 设置节点域名：

```bash
# 设置节点域名
curl -X PUT https://your-domain.com/api/node/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"domain": "your-domain.com"}'
```

系统会自动允许以下来源：
- `https://your-domain.com`
- `https://www.your-domain.com`

### 配置优先级

```
优先级从高到低：
1. DATABAG_WS_ORIGIN_STRICT=0     → 允许所有来源（开发模式）
2. DATABAG_WS_ALLOWED_ORIGINS     → 使用环境变量白名单
3. 数据库 CNFDomain 配置           → 回退到数据库配置
4. 全部未配置                      → 拒绝所有 WebSocket 连接
```

### 常见配置场景

#### 场景1：生产环境（单域名）

```yaml
environment:
  - DATABAG_WS_ORIGIN_STRICT=1
  - DATABAG_WS_ALLOWED_ORIGINS=https://your-domain.com
```

#### 场景2：生产环境（多域名/子域名）

```yaml
environment:
  - DATABAG_WS_ORIGIN_STRICT=1
  - DATABAG_WS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,https://app.your-domain.com
```

#### 场景3：开发环境

```yaml
environment:
  # 警告：生产环境不要使用此配置！
  - DATABAG_WS_ORIGIN_STRICT=0
```

### 故障排查

#### WebSocket 连接被拒绝

**症状**：浏览器控制台显示 `WebSocket connection to 'wss://your-domain.com/status' failed`

**排查步骤**：

```bash
# 1. 检查环境变量配置
docker exec databag env | grep DATABAG_WS

# 2. 检查日志
docker logs databag 2>&1 | grep -i websocket

# 3. 验证域名配置
docker exec databag sqlite3 /var/lib/databag/databag.db \
  "SELECT * FROM configs WHERE config_id='domain';"
```

**解决方案**：

1. 确认 `DATABAG_WS_ALLOWED_ORIGINS` 包含正确的域名
2. 确认域名格式为完整 URL（含 `https://`）
3. 重启服务：`docker-compose restart`

#### 跨域问题

**症状**：浏览器报错 `Cross origin requests are only supported for protocol schemes`

**原因**：Nginx 未正确传递 `Origin` 头

**解决方案**：

```nginx
location / {
    proxy_pass http://databag_server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Origin $http_origin;  # 添加此行
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 安全建议

1. **生产环境**：始终启用严格模式（`DATABAG_WS_ORIGIN_STRICT=1`）
2. **白名单**：明确列出所有允许的来源，不要使用通配符
3. **HTTPS**：确保所有客户端通过 HTTPS 连接
4. **监控**：监控 WebSocket 连接失败日志，及时发现攻击

### 受影响的端点

| 端点 | 路径 | 用途 |
|-----|------|------|
| Status | `/api/status` | 状态更新、消息同步 |
| Signal | `/api/signal` | WebRTC 信令 |
| Relay | `/api/relay` | 客户端中继 |

---

## SSL证书配置

### 方式1: Let's Encrypt（免费）

```bash
# 安装certbot
apt update
apt install certbot python3-certbot-nginx

# 获取证书
certbot certonly --standalone -d your-domain.com

# 复制证书
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/

# 设置自动续期
crontab -e
# 添加以下行：
0 0,12 * * * certbot renew --quiet
```

### 方式2: 已有证书

```bash
# 将证书文件放入ssl/目录
ssl/
├── cert.pem      # 证书文件
└── key.pem       # 私钥文件

# 如果证书链不完整，需要包含中间证书
# cert.pem 应该包含完整的证书链
```

### 方式3: 自签名证书（测试用）

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Databag/CN=your-domain.com"
```

---

## GitHub Actions CI/CD

### 1. 创建GitHub仓库

1. 在GitHub创建新仓库
2. 推送代码：

```bash
git remote add origin https://github.com/yourusername/databag.git
git push -u origin main
```

### 2. 配置Secrets

在GitHub仓库设置中添加以下Secrets：

| Secret名称 | 描述 | 示例 |
|-----------|------|-----|
| GHCR_TOKEN | GitHub Personal Access Token | ghp_xxxxxxxxxxxx |
| SERVER_HOST | 服务器IP地址 | 123.456.789.0 |
| SERVER_USER | SSH用户名 | ubuntu |
| SERVER_SSH_KEY | SSH私钥 | -----BEGIN OPENSSH... |
| SERVER_DEPLOY_PATH | 部署路径 | /opt/databag |

### 3. 创建Personal Access Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 生成新token（需要 `read:packages`, `write:packages` 权限）
3. 添加到仓库Secrets：`GHCR_TOKEN`

### 4. 配置自动部署

推送代码后，GitHub Actions会自动：
1. 构建Docker镜像
2. 推送到GitHub Container Registry
3. 部署到服务器

### 5. 手动触发部署

```bash
# 推送标签触发发布
git tag v1.0.0
git push origin v1.0.0
```

---

## 运维管理

### 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f
docker-compose logs -f app    # 只看app日志
docker-compose logs -f nginx  # 只看nginx日志

# 查看状态
docker-compose ps

# 查看资源使用
docker stats

# 更新镜像
docker-compose pull
docker-compose up -d

# 清理资源
docker system prune -a
```

### 数据备份

```bash
# 备份数据卷
docker run --rm -v databag_databag_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/databag-backup-$(date +%Y%m%d).tar.gz -C /data .

# 恢复数据
docker run --rm -v databag_databag_data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/databag-backup-20240122.tar.gz -C /data .
```

### 日志配置

```bash
# 查看应用日志
docker exec databag tail -f /var/log/databag.log

# 配置日志轮转
# 在/etc/logrotate.d/创建databag文件：
/var/lib/docker/volumes/databag_databag_data/_data/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### 监控

```bash
# 健康检查
curl https://your-domain.com/health

# 检查容器状态
docker-compose ps
docker exec databag curl -f http://localhost:7000/status
```

---

## 故障排查

### 服务无法启动

```bash
# 1. 检查端口是否被占用
netstat -tlnp | grep -E '443|7000'

# 2. 查看详细错误日志
docker-compose logs --tail=100

# 3. 检查配置文件
docker exec databag cat /app/databag/net/server/databag
```

### SSL证书问题

```bash
# 1. 检查证书文件权限
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# 2. 验证证书
openssl x509 -in ssl/cert.pem -text -noout

# 3. 测试HTTPS连接
openssl s_client -connect your-domain.com:443
```

### WebSocket连接失败

```bash
# 1. 检查Nginx WebSocket配置
# 确保有以下配置：
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";
# proxy_read_timeout 86400;

# 2. 检查防火墙
ufw status
ufw allow 443/tcp

# 3. 测试WebSocket
wss://your-domain.com/status
```

### 数据库问题

```bash
# 1. 检查数据库文件
ls -la /var/lib/docker/volumes/databag_databag_data/_data/

# 2. 修复SQLite（谨慎使用）
docker exec databag sqlite3 /var/lib/databag/databag.db "VACUUM;"

# 3. 查看数据库状态
docker exec databag sqlite3 /var/lib/databag/databag.db ".tables"
```

---

## 常见问题

### Q1: 如何修改管理员密码？

```bash
# 方法1: 通过环境变量（重启后生效）
# 编辑docker-compose.yml，修改ADMIN值
docker-compose up -d

# 方法2: 直接修改数据库
docker exec databag sqlite3 /var/lib/databag/databag.db \
  "UPDATE configs SET str_value='new-password' WHERE config_id='token';"
docker-compose restart
```

### Q2: 如何限制注册用户数？

在管理界面中设置 `Open Access Limit`。

### Q3: 如何配置推送通知？

本部署不包含FCM推送，移动端需要保持App在线才能实时接收消息。

### Q4: 如何升级到新版本？

```bash
# 1. 拉取最新镜像
docker-compose pull

# 2. 重启服务
docker-compose up -d

# 3. 检查版本
docker exec databag ./databag -v
```

### Q5: 如何重置所有数据？

```bash
# 危险操作！会删除所有数据
docker-compose down -v
docker-compose up -d
```

### Q6: Nginx性能优化？

编辑 `nginx.conf`：

```nginx
# 增加worker进程数
worker_processes auto;

# 增加worker连接数
worker_rlimit_nofile 65535;

events {
    worker_connections 10240;
    use epoll;
    multi_accept on;
}

http {
    # 开启缓存
    open_file_cache max=10000 inactive=30s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

---

## 联系与支持

- GitHub Issues: [https://github.com/balzack/databag/issues](https://github.com/balzack/databag/issues)
- 官方文档: [https://docs.databag.org](https://docs.databag.org)

---

## 许可证

MIT License
