# 升级指南

## 最近更新

### 2026-01-29: 密码安全策略更新

**重要变更**：服务端默认已启用强密码策略，与客户端验证规则保持一致。

#### 变更内容

1. **服务端默认值更新**（`net/server/internal/appValues.go`）：
   - `APPPasswordRequireUpper`: `false` → `true`
   - `APPPasswordRequireLower`: `false` → `true`
   - `APPPasswordRequireNumber`: `false` → `true`
   - `APPPasswordRequireSpecial`: `false` → `true`

2. **配置文件更新**：
   - `docker-compose.yml`: 明确启用密码复杂度要求
   - `deploy/docker-compose.yml`: 添加完整的注释说明
   - `examples/docker-basic/docker-compose.yml`: 更新注释
   - `examples/docker-ssl/docker-compose.yml`: 更新注释
   - `examples/docker-nginx-proxy/docker-compose.yml`: 更新注释

3. **文档更新**：
   - `SECURITY_LOGIN.md`: 更新默认值说明，添加升级注意事项

#### 影响范围

- ✅ **新安装**：自动应用新的密码策略
- ⚠️ **现有部署**：
  - **不影响已登录用户**
  - 只在设置/修改密码时应用新规则
  - 如果现有用户修改密码，新密码必须符合强密码要求

#### 升级步骤

1. **更新代码**：
   ```bash
   git pull
   ```

2. **重新构建容器**：
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

3. **验证配置**（可选）：
   - 创建新用户，测试是否应用了强密码策略
   - 尝试修改现有用户密码，确保规则生效

#### 回退方案

如果需要回退到之前的密码策略，在 `docker-compose.yml` 中添加以下环境变量：

```yaml
environment:
  - DATABAG_PASSWORD_REQUIRE_UPPER=false
  - DATABAG_PASSWORD_REQUIRE_LOWER=false
  - DATABAG_PASSWORD_REQUIRE_NUMBER=false
  - DATABAG_PASSWORD_REQUIRE_SPECIAL=false
```

然后重启容器：
```bash
docker-compose down
docker-compose up -d
```

> 注意：回退的同时需要修改客户端验证规则（`app/mobile/src/utils/validation.js` 和 `app/client/web/src/utils/validation.js`），否则用户无法注册或修改密码。

#### 客户端与服务端一致性

当前版本的客户端验证规则：
- 移动端：`app/mobile/src/utils/validation.js`
- Web端：`app/client/web/src/utils/validation.js`

**规则：**
- 最小长度：8 字符
- 最大长度：128 字符
- 必须包含：大写字母、小写字母、数字、特殊字符

**特殊字符支持：** `@ $ ! % * ? &`

这些规则与服务端默认值现已完全一致。

### 代码清理

2026-01-29 删除了未使用的文件：
- `app/mobile/src/api/setChannelTopicAsset.js`（已确认无引用）

---

## 版本历史

### v1.x
- 基础功能实现
- WebSocket 通信
- 端到端加密
- 多因素认证

---

## 升级前检查清单

在执行升级前，请确认：

- [ ] 备份当前配置文件
- [ ] 备份数据库（如使用外部数据库）
- [ ] 阅读本次升级的所有变更说明
- [ ] 确认客户端版本兼容性
- [ ] 在测试环境验证升级流程
- [ ] 准备回滚方案

---

## 升级后验证步骤

升级完成后，执行以下验证：

1. **基本功能测试**：
   - 登录现有账户
   - 创建新账户
   - 发送消息
   - 上传图片/文件

2. **安全功能测试**：
   - 测试密码强度验证
   - 测试登录失败锁定
   - 测试 MFA（如已启用）

3. **性能测试**：
   - 检查响应时间
   - 检查资源使用
   - 检查日志错误

4. **客户端兼容性**：
   - 移动端应用测试
   - Web端应用测试

---

## 回滚步骤

如果升级后出现问题，按以下步骤回滚：

1. 停止容器：
   ```bash
   docker-compose down
   ```

2. 恢复备份的配置文件

3. 恢复之前的镜像或重新构建旧版本：
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. 验证功能正常

---

## 获取帮助

如果升级过程中遇到问题：

1. 查看日志：
   ```bash
   docker-compose logs -f
   ```

2. 查看安全配置文档：`SECURITY_LOGIN.md`

3. 查看部署文档：`deploy/README.md`

4. 提交 Issue：[GitHub Issues](https://github.com/balzack/databag/issues)
