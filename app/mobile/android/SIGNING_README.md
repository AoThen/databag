# Android Release Signing Configuration

## 环境变量方式（推荐）

在运行 release 构建前，设置以下环境变量：

### Linux/macOS

```bash
export SIGN_STORE_FILE="/path/to/your/release-key.keystore"
export SIGN_STORE_PASSWORD="your_store_password"
export SIGN_KEY_ALIAS="your_key_alias"
export SIGN_KEY_PASSWORD="your_key_password"

# 然后构建
cd android
./gradlew assembleRelease
```

### Windows (PowerShell)

```powershell
$env:SIGN_STORE_FILE="C:\path\to\release-key.keystore"
$env:SIGN_STORE_PASSWORD="your_store_password"
$env:SIGN_KEY_ALIAS="your_key_alias"
$env:SIGN_KEY_PASSWORD="your_key_password"

# 然后构建
cd android
.\gradlew.bat assembleRelease
```

## Gradle Properties 方式（替代方案）

在 `~/.gradle/gradle.properties` 文件中添加：

```properties
SIGN_STORE_FILE=/path/to/your/release-key.keystore
SIGN_STORE_PASSWORD=your_store_password
SIGN_KEY_ALIAS=your_key_alias
SIGN_KEY_PASSWORD=your_key_password
```

## 生成 Keystore

如果还没有签名密钥，使用以下命令生成：

```bash
keytool -genkeypair -v -storetype JKS \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -keystore release-key.keystore \
  -alias databag-release \
  -keypass your_key_password \
  -storepass your_store_password
```

## 构建验证

构建完成后，可以使用以下命令验证 APK 是否已签名：

```bash
# 检查签名信息
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk

# 查看签名证书
keytool -list -v -keystore release-key.keystore
```

## CI/CD 集成

### GitHub Actions 示例

```yaml
- name: Build Release APK
  run: |
    echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > release-key.keystore
    export SIGN_STORE_FILE="release-key.keystore"
    export SIGN_STORE_PASSWORD="${{ secrets.KEYSTORE_PASSWORD }}"
    export SIGN_KEY_ALIAS="${{ secrets.KEY_ALIAS }}"
    export SIGN_KEY_PASSWORD="${{ secrets.KEY_PASSWORD }}"
    cd android
    ./gradlew assembleRelease
```

### GitLab CI 示例

```yaml
build:
  variables:
    KEYSTORE_FILE: "$KEYSTORE_BASE64"
  before_script:
    - echo "$KEYSTORE_FILE" | base64 -d > release-key.keystore
    - export SIGN_STORE_FILE="release-key.keystore"
    - export SIGN_STORE_PASSWORD="$KEYSTORE_PASSWORD"
    - export SIGN_KEY_ALIAS="$KEY_ALIAS"
    - export SIGN_KEY_PASSWORD="$KEY_PASSWORD"
  script:
    - cd android
    - ./gradlew assembleRelease
```

## 注意事项

1. **不要将 keystore 文件提交到代码仓库**
2. **使用强密码保护 keystore**
3. **备份 keystore 文件并妥善保管**
4. **如果丢失 keystore，无法更新已发布的应用**
