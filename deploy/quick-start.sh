#!/bin/bash

# Databag 快速部署脚本
# 支持Linux/macOS

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Databag 快速部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查Docker
echo -e "${YELLOW}检查Docker环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装${NC}"
    echo "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    echo "请先安装Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker环境检查通过${NC}"

# 检查目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "deploy" ]; then
    echo -e "${RED}错误: 未找到deploy目录${NC}"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

cd deploy

# 步骤1: 配置管理员密码
echo ""
echo -e "${YELLOW}步骤1: 配置管理员密码${NC}"
read -p "请设置管理员密码: " ADMIN_PASSWORD
if [ -z "$ADMIN_PASSWORD" ]; then
    echo -e "${RED}错误: 密码不能为空${NC}"
    exit 1
fi

# 更新docker-compose.yml
echo -e "${BLUE}更新配置文件...${NC}"
sed -i "s/- ADMIN=your-secure-password-here/- ADMIN=$ADMIN_PASSWORD/" docker-compose.yml
echo -e "${GREEN}✓ 管理员密码已配置${NC}"

# 步骤2: SSL证书
echo ""
echo -e "${YELLOW}步骤2: SSL证书配置${NC}"
echo "请选择证书来源:"
echo "1) 使用Let's Encrypt（推荐，需要域名已解析）"
echo "2) 使用已有证书文件"
echo "3) 生成自签名证书（仅测试用）"
echo "4) 跳过（使用HTTP）"
read -p "请选择 [1-4]: " SSL_CHOICE

case $SSL_CHOICE in
    1)
        echo ""
        read -p "请输入你的域名: " DOMAIN
        if [ -z "$DOMAIN" ]; then
            echo -e "${RED}错误: 域名不能为空${NC}"
            exit 1
        fi

        echo -e "${BLUE}获取Let's Encrypt证书...${NC}"
        if command -v certbot &> /dev/null; then
            sudo certbot certonly --standalone -d "$DOMAIN"
            sudo cp /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem ssl/cert.pem
            sudo cp /etc/letsencrypt/live/"$DOMAIN"/privkey.pem ssl/key.pem
            sudo chmod 644 ssl/cert.pem
            sudo chmod 600 ssl/key.pem
            echo -e "${GREEN}✓ Let's Encrypt证书已配置${NC}"
        else
            echo -e "${YELLOW}未安装certbot，请手动配置：${NC}"
            echo "  sudo apt install certbot python3-certbot-nginx"
            echo "  sudo certbot certonly --standalone -d $DOMAIN"
            echo "  然后复制证书到ssl/目录"
        fi
        ;;
    2)
        echo -e "${BLUE}请将证书文件放入ssl/目录：${NC}"
        echo "  - ssl/cert.pem (证书文件)"
        echo "  - ssl/key.pem (私钥文件)"
        echo ""
        if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
            echo -e "${YELLOW}证书文件不存在，将使用HTTP模式${NC}"
        else
            echo -e "${GREEN}✓ 证书文件已找到${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}生成自签名证书...${NC}"
        read -p "请输入域名或IP: " DOMAIN
        if [ -z "$DOMAIN" ]; then
            DOMAIN="localhost"
        fi
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=Databag/CN=$DOMAIN"
        chmod 600 ssl/key.pem
        chmod 644 ssl/cert.pem
        echo -e "${GREEN}✓ 自签名证书已生成${NC}"
        ;;
    4)
        echo -e "${YELLOW}跳过SSL配置，将使用HTTP模式${NC}"
        # 修改docker-compose移除nginx
        ;;
esac

# 步骤3: 启动服务
echo ""
echo -e "${YELLOW}步骤3: 启动服务${NC}"

# 检查是否有SSL证书
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo -e "${BLUE}使用HTTPS模式启动...${NC}"
else
    echo -e "${YELLOW}警告: 未找到SSL证书，将使用HTTP模式${NC}"
    echo "  Nginx将仅监听80端口"
fi

echo -e "${BLUE}构建并启动Docker容器...${NC}"
cd "$SCRIPT_DIR"

# 构建镜像
echo -e "${BLUE}构建Docker镜像...${NC}"
docker-compose -f deploy/docker-compose.yml build

# 启动服务
echo -e "${BLUE}启动服务...${NC}"
docker-compose -f deploy/docker-compose.yml up -d

# 等待服务启动
echo -e "${BLUE}等待服务启动...${NC}"
sleep 5

# 检查状态
echo ""
echo -e "${YELLOW}检查服务状态...${NC}"
docker-compose -f deploy/docker-compose.yml ps

# 步骤4: 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ -f "deploy/ssl/cert.pem" ] && [ -f "deploy/ssl/key.pem" ]; then
    echo -e "访问地址: ${BLUE}https://localhost${NC}"
    echo "管理密码: ${BLUE}$ADMIN_PASSWORD${NC}"
else
    echo -e "访问地址: ${BLUE}http://localhost${NC}"
    echo "管理密码: ${BLUE}$ADMIN_PASSWORD${NC}"
fi

echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  查看日志: docker-compose -f deploy/docker-compose.yml logs -f"
echo "  重启服务: docker-compose -f deploy/docker-compose.yml restart"
echo "  停止服务: docker-compose -f deploy/docker-compose.yml down"
echo ""

# 健康检查
echo -e "${YELLOW}执行健康检查...${NC}"
sleep 3
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7000/status 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ 服务运行正常${NC}"
else
    echo -e "${YELLOW}⚠ 服务可能仍在启动中，请稍后检查${NC}"
fi

echo ""
echo -e "${BLUE}详细配置说明请参考: deploy/DEPLOYMENT.md${NC}"
