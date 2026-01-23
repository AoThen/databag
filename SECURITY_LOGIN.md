# Databag 登录安全加固文档

## 概述

本文档描述了针对 Databag 账号认证系统实施的安全加固措施，防止暴力破解攻击。

## 安全功能

### 1. 登录失败跟踪与账号锁定

系统现在会跟踪每个账号的登录失败尝试，并在超过阈值时临时锁定账号。

**默认配置：**
- 失败时间窗口：300 秒（5 分钟）
- 失败次数阈值：5 次
- 超过阈值后锁定，直到时间窗口过期

**工作原理：**
1. 每次登录失败，系统会增加该账号的失败计数
2. 登录成功时，失败计数自动重置
3. 如果在时间窗口内失败次数超过阈值，后续登录尝试将被拒绝

### 2. 渐进式响应延迟

为防止时间攻击和自动化暴力破解，系统会对失败的登录请求应用渐进式延迟。

**延迟计算：**
- 基础延迟：1 秒（可配置）
- 指数增长：2^失败次数
- 最大延迟上限：30 秒

**示例：**
- 第 1 次失败：2 秒延迟
- 第 2 次失败：4 秒延迟
- 第 3 次失败：8 秒延迟
- 第 4 次失败：16 秒延迟
- 第 5 次及以上：30 秒延迟

### 3. 密码强度验证

系统可以强制要求密码满足特定的强度标准。

**可配置要求：**
- 最小长度：默认 8 字符
- 最大长度：默认 128 字符
- 必须包含大写字母
- 必须包含小写字母
- 必须包含数字
- 必须包含特殊字符

**默认配置：**
仅启用最小和最大长度限制，其他要求默认关闭，以免破坏现有用户密码。

## 环境变量配置

所有安全参数都可以通过 Docker 环境变量配置。

### 登录安全参数

| 环境变量 | 说明 | 默认值 | 推荐值 |
|---------|------|--------|--------|
| `DATABAG_LOGIN_FAIL_PERIOD` | 登录失败锁定时间窗口（秒） | 300 (5分钟) | 300-600 |
| `DATABAG_LOGIN_FAIL_COUNT` | 登录失败次数阈值 | 5 | 3-5 |
| `DATABAG_LOGIN_ALLOW_WAIT` | 登录失败响应延迟基础时间（秒） | 1 | 1-2 |

### 密码强度参数

| 环境变量 | 说明 | 默认值 | 推荐值 |
|---------|------|--------|--------|
| `DATABAG_PASSWORD_MIN_LENGTH` | 密码最小长度 | 8 | 12+ |
| `DATABAG_PASSWORD_MAX_LENGTH` | 密码最大长度 | 128 | 128 |
| `DATABAG_PASSWORD_REQUIRE_UPPER` | 要求大写字母 | false | true |
| `DATABAG_PASSWORD_REQUIRE_LOWER` | 要求小写字母 | false | true |
| `DATABAG_PASSWORD_REQUIRE_NUMBER` | 要求数字 | false | true |
| `DATABAG_PASSWORD_REQUIRE_SPECIAL` | 要求特殊字符 | false | true |

## 配置示例

### 生产环境推荐配置

```yaml
services:
  app:
    environment:
      # 管理员密码
      - ADMIN=your-secure-admin-password

      # 登录安全
      - DATABAG_LOGIN_FAIL_PERIOD=600      # 10 分钟锁定窗口
      - DATABAG_LOGIN_FAIL_COUNT=3         # 3 次失败后锁定
      - DATABAG_LOGIN_ALLOW_WAIT=2         # 2 秒基础延迟

      # 密码强度（生产环境建议启用）
      - DATABAG_PASSWORD_MIN_LENGTH=12     # 最少 12 字符
      - DATABAG_PASSWORD_MAX_LENGTH=128    # 最多 128 字符
      - DATABAG_PASSWORD_REQUIRE_UPPER=true
      - DATABAG_PASSWORD_REQUIRE_LOWER=true
      - DATABAG_PASSWORD_REQUIRE_NUMBER=true
      - DATABAG_PASSWORD_REQUIRE_SPECIAL=true
```

### 开发环境配置

```yaml
services:
  app:
    environment:
      - ADMIN=admin

      # 宽松的登录限制便于测试
      - DATABAG_LOGIN_FAIL_PERIOD=60       # 1 分钟锁定窗口
      - DATABAG_LOGIN_FAIL_COUNT=10        # 允许更多失败尝试
      - DATABAG_LOGIN_ALLOW_WAIT=0         # 关闭延迟

      # 宽松的密码要求
      - DATABAG_PASSWORD_MIN_LENGTH=6
      # 不启用复杂度要求
```

## 数据库变更

新增字段到 `account` 表：

```sql
ALTER TABLE account ADD COLUMN login_failed_time INTEGER DEFAULT 0;
ALTER TABLE account ADD COLUMN login_failed_count INTEGER DEFAULT 0;
```

这些字段会在 GORM 自动迁移时自动创建。

## 安全建议

### 1. 生产环境配置

- 设置严格的密码策略（最小长度 12+，要求大小写数字特殊字符）
- 将登录失败阈值设置为 3-5 次
- 锁定时间窗口设置为 10-30 分钟
- 启用 MFA 双因素认证（已有功能）

### 2. 监控建议

- 监控频繁失败的登录尝试
- 检查是否有特定 IP 或账号被频繁锁定
- 定期审查登录日志，识别异常模式

### 3. 用户教育

- 通知用户新的密码强度要求
- 提醒用户启用 MFA
- 教育用户识别钓鱼攻击

## 故障排查

### 错误：account temporarily locked

账号因多次登录失败被锁定。等待锁定时间窗口过期，或由管理员重置。

### 错误：password too short

密码长度小于 `DATABAG_PASSWORD_MIN_LENGTH` 配置的最小值。

### 错误：password must contain uppercase letters

密码不包含大写字母（当 `DATABAG_PASSWORD_REQUIRE_UPPER=true` 时）。

### 错误：password too long

密码长度超过 `DATABAG_PASSWORD_MAX_LENGTH` 配置的最大值。

## 向后兼容性

- 所有新参数都有默认值
- 默认配置不会破坏现有用户密码
- 密码复杂度要求默认关闭
- 已有数据库会自动迁移添加新字段

## 测试

运行测试以验证安全功能：

```bash
cd net/server
go run databag -t path/to/test/directory
```

测试文件位置：
- `internal/passwordUtil_test.go` - 密码验证测试
- `internal/authLogin_test.go` - 登录认证测试

## 相关文件

- `internal/store/schema.go` - 数据库模式定义
- `internal/authUtil.go` - 认证逻辑实现
- `internal/passwordUtil.go` - 密码强度验证
- `internal/loginConfig.go` - 配置读取
- `internal/configUtil.go` - 配置常量
- `internal/api_addAccount.go` - 账号创建（包含密码验证）
- `internal/api_setAccountLogin.go` - 密码修改（包含密码验证）
- `internal/api_setAccountAuthentication.go` - 密码重置（包含密码验证）
