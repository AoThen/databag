#!/bin/bash

# SSL证书准备脚本
# 用于将SSL证书文件复制到正确位置

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/ssl"

echo "=========================================="
echo "Databag SSL证书配置脚本"
echo "=========================================="

# 检查ssl目录是否存在
if [ ! -d "$SSL_DIR" ]; then
    echo "创建ssl目录..."
    mkdir -p "$SSL_DIR"
fi

# 检查证书文件
echo ""
echo "检查证书文件..."

CERT_FILE=""
KEY_FILE=""

# 查找证书文件
for file in "$SSL_DIR"/*.pem "$SSL_DIR"/*.crt; do
    if [ -f "$file" ]; then
        if [[ "$file" == *"fullchain"* ]] || [[ "$file" == *"cert"* ]]; then
            CERT_FILE="$file"
        fi
        if [[ "$file" == *"privkey"* ]] || [[ "$file" == *"key"* ]]; then
            KEY_FILE="$file"
        fi
    fi
done

# 如果没有找到，提示用户
if [ -z "$CERT_FILE" ] || [ -z "$KEY_FILE" ]; then
    echo ""
    echo "未找到证书文件。请选择证书来源："
    echo "1) Let's Encrypt证书"
    echo "2) 自有证书"
    echo "3) 生成自签名证书（测试用）"
    echo ""
    read -p "请选择 [1-3]: " choice

    case $choice in
        1)
            echo ""
            echo "请运行以下命令获取Let's Encrypt证书："
            echo ""
            echo "  # 安装certbot"
            echo "  sudo apt update"
            echo "  sudo apt install certbot python3-certbot-nginx"
            echo ""
            echo "  # 获取证书（替换your-domain.com为你的域名）"
            echo "  sudo certbot certonly --standalone -d your-domain.com"
            echo ""
            echo "  # 复制证书文件"
            echo "  sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/"
            echo "  sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/"
            echo ""
            ;;
        2)
            echo ""
            echo "请将证书文件放入ssl/目录："
            echo "  - 证书文件: ssl/cert.pem (或 fullchain.pem)"
            echo "  - 私钥文件: ssl/key.pem (或 privkey.pem)"
            echo ""
            echo "然后重新运行此脚本。"
            ;;
        3)
            echo ""
            echo "生成自签名证书..."
            DOMAIN=${1:-"localhost"}
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "$SSL_DIR/key.pem" \
                -out "$SSL_DIR/cert.pem" \
                -subj "/C=CN/ST=Beijing/L=Beijing/O=Databag/CN=$DOMAIN"
            echo "自签名证书已生成："
            echo "  - 证书: $SSL_DIR/cert.pem"
            echo "  - 私钥: $SSL_DIR/key.pem"
            ;;
    esac
else
    echo "找到证书文件："
    echo "  证书: $CERT_FILE"
    echo "  私钥: $KEY_FILE"

    # 创建符号链接
    if [ "$CERT_FILE" != "$SSL_DIR/cert.pem" ]; then
        ln -sf "$(basename "$CERT_FILE")" "$SSL_DIR/cert.pem"
    fi
    if [ "$KEY_FILE" != "$SSL_DIR/key.pem" ]; then
        ln -sf "$(basename "$KEY_FILE")" "$SSL_DIR/key.pem"
    fi

    echo ""
    echo "证书链接已创建："
    ls -la "$SSL_DIR/"
fi

# 设置正确的权限
echo ""
echo "设置文件权限..."
chmod 600 "$SSL_DIR/key.pem" 2>/dev/null || true
chmod 644 "$SSL_DIR/cert.pem" 2>/dev/null || true

echo ""
echo "=========================================="
echo "SSL证书配置完成！"
echo "=========================================="
echo ""
echo "启动服务："
echo "  docker-compose up -d"
echo ""
echo "验证证书："
echo "  openssl s_client -connect localhost:443 -servername your-domain.com"
echo ""
