# GitHub Actions CI/CD 配置说明

## 概述

本配置使用GitHub Actions实现：
1. 自动构建Docker镜像
2. 推送到GitHub Container Registry
3. 自动部署到服务器
4. 部署失败通知

## 工作流程

```
代码推送
    │
    ▼
┌─────────────────┐
│  构建并测试      │  ← 运行单元测试
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 构建Docker镜像   │  ← 多架构构建
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 推送到GHCR      │  ← ghcr.io/username/repo
└────────┬────────┘
         │
         ▼
    是否是发布版？
    /          \
  否           是
   │           │
   ▼           ▼
 结束        部署到服务器
              │
              ▼
         发送通知
```

## 配置Secrets

在GitHub仓库设置中添加以下Secrets：

### 必需Secrets

| Secret名称 | 描述 | 获取方式 |
|-----------|------|---------|
| `GHCR_TOKEN` | GitHub Personal Access Token | GitHub Settings → Developer settings → Personal access tokens |
| `SERVER_HOST` | 服务器IP地址 | - |
| `SERVER_USER` | SSH用户名 | 通常是 `ubuntu` 或 `root` |
| `SERVER_SSH_KEY` | SSH私钥 | `cat ~/.ssh/id_rsa` |
| `SERVER_DEPLOY_PATH` | 部署路径 | 例如 `/opt/databag` |

### 可选Secrets

| Secret名称 | 描述 |
|-----------|------|
| `SLACK_WEBHOOK_URL` | Slack Webhook URL（部署失败通知） |

## 创建Personal Access Token

1. 访问 GitHub Settings
2. → Developer settings
3. → Personal access tokens
4. → Tokens (classic)
5. → Generate new token (classic)

**必要权限**：
- `repo` - 完整控制私有仓库
- `read:packages` - 读取容器镜像
- `write:packages` - 推送容器镜像

## 配置SSH访问

### 1. 生成SSH密钥对（如果没有）

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### 2. 添加公钥到服务器

```bash
# 将公钥添加到服务器的authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

### 3. 测试SSH连接

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@your-server-ip
```

## 手动触发部署

### 方式1: 推送标签

```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

### 方式2: 手动运行工作流

1. 访问 GitHub仓库 → Actions
2. 选择 "Docker Build and Publish" 工作流
3. 点击 "Run workflow"

## 多架构构建

默认配置支持：
- `linux/amd64` - x86_64 服务器
- `linux/arm64` - ARM64 服务器（如Apple Silicon Mac构建）

### 指定架构构建

```yaml
# 在docker-publish.yml中设置
env:
  DATABAG_GOARCH: arm64
  DATABAG_GOOS: linux
```

## 镜像标签策略

| 触发条件 | 镜像标签 |
|---------|---------|
| 推送到 main 分支 | `latest` |
| 推送标签 v1.0.0 | `v1.0.0`, `v1`, `latest` |
| PR合并 | `sha-{commit_hash}` |

## 故障排查

### 构建失败

```bash
# 检查Dockerfile语法
docker build -t test .

# 检查构建上下文
docker context ls
```

### 推送失败

```bash
# 检查登录状态
docker login ghcr.io -u username -p $GHCR_TOKEN

# 检查镜像名称
docker images | grep ghcr.io
```

### 部署失败

```bash
# 手动测试SSH连接
ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no ubuntu@server-ip "echo 'SSH OK'"

# 检查服务器Docker
ssh ubuntu@server-ip "docker --version && docker-compose --version"
```

## 安全最佳实践

### 1. 使用Short-lived Tokens

```yaml
# 不要在代码中硬编码Token
# 使用GitHub Secrets
env:
  REGISTRY_TOKEN: ${{ secrets.GHCR_TOKEN }}
```

### 2. 限制容器权限

```yaml
# Dockerfile中不使用root用户
RUN useradd -m appuser
USER appuser
```

### 3. 扫描镜像漏洞

```yaml
# 添加漏洞扫描步骤
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ghcr.io/user/repo:latest'
    format: 'table'
    exit-code: '1'
    severity: 'CRITICAL,HIGH'
```

## 监控与告警

### 部署成功

工作流完成后会自动发送通知（如果配置了Slack）。

### 部署失败

1. 检查GitHub Actions日志
2. 查看服务器日志：`docker-compose logs`
3. 检查资源使用：`docker stats`

## 性能优化

### 构建缓存

```yaml
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### 并行构建

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        arch: [amd64, arm64]
    steps:
      - name: Build for ${{ matrix.arch }}
        run: |
          docker buildx build --platform linux/${{ matrix.arch }} ...
```

## 常见问题

### Q: 如何跳过某个分支的自动部署？

在工作流文件中添加条件：

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    # ...
```

### Q: 如何回滚到之前的版本？

```bash
# 在服务器上
cd /opt/databag
docker-compose pull app:latest
docker-compose up -d
```

### Q: 镜像构建很慢？

1. 检查网络连接
2. 使用构建缓存（已默认启用）
3. 减少构建上下文大小（添加.dockerignore）

## 相关资源

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Docker Buildx](https://docs.docker.com/build/buildx/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
