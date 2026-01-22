# SSL证书配置说明

## 目录结构

```
deploy/
├── ssl/
│   ├── cert.pem      # 证书文件 (必需)
│   └── key.pem       # 私钥文件 (必需)
└── nginx.conf        # Nginx配置
```

## 证书要求

### 文件格式

| 文件 | 格式 | 说明 |
|-----|------|------|
| cert.pem | PEM | X.509证书，可以包含完整证书链 |
| key.pem | PEM | RSA/ECDSA私钥 |

### 证书链

确保 `cert.pem` 包含完整的证书链：

```
-----BEGIN CERTIFICATE-----
你的域名证书
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
中间证书
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
根证书（可选）
-----END CERTIFICATE-----
```

## 获取证书

### 方式1: Let's Encrypt（推荐，免费）

```bash
# 安装certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书（替换your-domain.com）
sudo certbot certonly --standalone -d your-domain.com

# 复制证书
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem deploy/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem deploy/ssl/key.pem

# 设置权限
sudo chmod 644 deploy/ssl/cert.pem
sudo chmod 600 deploy/ssl/key.pem
```

### 方式2: 证书颁发机构

从你的CA获取证书后：

```bash
# 证书文件应该是这样的
deploy/ssl/cert.pem  ← 包含完整证书链
deploy/ssl/key.pem   ← 私钥文件
```

### 方式3: 自签名证书（仅测试用）

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout deploy/ssl/key.pem \
    -out deploy/ssl/cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=Databag/CN=your-domain.com"

# 浏览器会显示不安全警告，仅用于测试
```

## 验证证书

```bash
# 1. 检查证书文件是否存在且有效
openssl x509 -in deploy/ssl/cert.pem -text -noout

# 2. 检查私钥匹配
openssl rsa -in deploy/ssl/key.pem -check

# 3. 验证证书链
openssl verify -CAfile deploy/ssl/cert.pem deploy/ssl/cert.pem

# 4. 测试HTTPS连接
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## 证书文件格式转换

### PEM转PFX（Windows/IIS）

```bash
openssl pkcs12 -export \
    -out certificate.pfx \
    -inkey key.pem \
    -in cert.pem \
    -certfile ca-cert.pem
```

### CER转PEM

```bash
# .cer to .pem
openssl x509 -in certificate.cer -out certificate.pem -outform PEM
```

## 自动续期（Let's Encrypt）

### Cron任务

```bash
# 编辑crontab
crontab -e

# 添加续期任务（每天凌晨0点检查）
0 0 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /path/to/deploy/ssl/ && cp /etc/letsencrypt/live/your-domain.com/privkey.pem /path/to/deploy/ssl/"
```

### 续期后重启

```bash
# 创建续期钩子脚本
cat > /etc/letsencrypt/renewal-hooks/deploy/restart-databag.sh << 'EOF'
#!/bin/bash
cd /opt/databag/deploy
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
docker-compose restart nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-databag.sh
```

## 故障排查

### 错误：证书不匹配

```bash
# 检查私钥和证书是否匹配
openssl x509 -noout -modulus -in cert.pem | openssl md5
openssl rsa -noout -modulus -in key.pem | openssl md5
# 两个MD5值应该相同
```

### 错误：证书过期

```bash
# 检查证书有效期
openssl x509 -in cert.pem -dates -noout

# 如果使用Let's Encrypt，查看续期状态
certbot certificates
```

### 错误：私钥权限

```bash
# 私钥权限必须是600
chmod 600 ssl/key.pem
ls -la ssl/
```

## 快速开始

```bash
# 1. 进入部署目录
cd deploy

# 2. 运行证书准备脚本
chmod +x prepare-ssl.sh
./prepare-ssl.sh

# 3. 按照提示选择证书来源

# 4. 启动服务
docker-compose up -d
```
