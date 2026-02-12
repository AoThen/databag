# Databag 完整部署配置
# 作者: Databag Community
# 更新时间: 2026-01

# 目录结构
# deploy/
# ├── docker-compose.yml        # Docker Compose 配置（生产环境）
# ├── docker-compose.example.yml # 完整配置示例（包含所有可选参数）
# ├── nginx/
# │   └── nginx.conf            # Nginx 配置
# ├── .github/
# │   └── workflows/
# │       └── docker-publish.yml # GitHub Actions CI/CD
# ├── SECURITY_LOGIN.md         # 登录安全详细配置指南
# └── README.md                 # 本文档

# 环境准备
# 1. 安装 Docker 和 Docker Compose
# 2. 准备 SSL 证书文件
# 3. 配置域名 DNS 记录

# 快速开始
# 1. 修改 docker-compose.yml 中的环境变量配置
# 2. 准备 SSL 证书到 ssl/ 目录（如需 HTTPS）
# 3. 运行: docker-compose up -d
# 4. 访问: https://your-domain.com

# 重要配置说明
# ========================
# 1. 安全配置
#    - 默认已启用强密码策略（要求大写、小写、数字、特殊字符）
#    - 默认已启用登录失败锁定和IP封禁
#    - 建议为生产环境配置更严格的参数（见 SECURITY_LOGIN.md）
#
# 2. 必需配置
#    - ADMIN: 设置管理员密码（必须为强密码）
#    - DATABAG_WS_ORIGIN_STRICT: 生产环境设为 1（严格模式）
#
# 3. 可选配置
#    - 登录安全参数：失败锁定时间、次数阈值、响应延迟
#    - 密码强度参数：最小/最大长度、复杂度要求
#    - IP封禁参数：失败阈值、封禁时长
#
# 详细说明请参考各配置文件中的注释和 SECURITY_LOGIN.md
