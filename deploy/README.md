# Databag 完整部署配置
# 作者: Databag Community
# 更新时间: 2024-01

# 目录结构
# deploy/
# ├── docker-compose.yml        # Docker Compose 配置
# ├── nginx/
# │   └── nginx.conf            # Nginx 配置
# ├── .github/
# │   └── workflows/
# │       └── docker-publish.yml # GitHub Actions CI/CD
# └── README.md                 # 本文档

# 环境准备
# 1. 安装 Docker 和 Docker Compose
# 2. 准备 SSL 证书文件
# 3. 配置域名 DNS 记录

# 快速开始
# 1. 修改 docker-compose.yml 中的配置
# 2. 准备 SSL 证书到 ssl/ 目录
# 3. 运行: docker-compose up -d
# 4. 访问: https://your-domain.com

# 详细说明请参考各配置文件中的注释
