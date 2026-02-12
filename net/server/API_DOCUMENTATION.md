# Databag API Documentation

## Base URL

The base URL depends on your deployment configuration:
- Development: `http://localhost:7000`
- Production: `https://your-domain.com`

## Authentication

### Basic Authentication
```http
Authorization: Basic <base64(username:password)>
```

### Bearer Token Authentication
```http
Authorization: Bearer <token>
```

### Agent Token Authentication
```http
GET /endpoint?agent=<guid>.<token>
```

---

## Account API

### Create Account
**POST** `/account/profile`

Create a new account with username and password.

**Request Headers:**
- `Authorization: Basic <base64(username:password)>` OR
- `Credentials: Basic <base64(username:password)>`

**Response:** `200 OK`
```json
{
  "guid": "string",
  "handle": "string",
  "name": "string",
  "description": "string",
  "location": "string",
  "image": "string",
  "revision": 123,
  "version": "string",
  "node": "string"
}
```

### Login
**POST** `/account/login`

Login to existing account.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Request Headers:**
- `Authorization: Basic <base64(username:password)>`

**Response:** `200 OK` - No body on success

### Get Account Status
**GET** `/account/status`

Get account status and configuration.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Response:** `200 OK`
```json
{
  "disabled": false,
  "storageUsed": 1234567,
  "storageAvailable": 1073741824,
  "forwardingAddress": null,
  "searchable": true,
  "mfaEnabled": false,
  "pushEnabled": true,
  "sealable": true,
  "seal": null,
  "enableIce": false,
  "allowUnsealed": true,
  "webPushKey": "string"
}
```

### Set Account Authentication
**PUT** `/account/auth`

Update account password.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Request Headers:**
- `Authorization: Basic <base64(username:password)>` OR
- `Credentials: Basic <base64(username:password)>`

**Response:** `200 OK` - No body on success

---

## Contact API

### Get Cards
**GET** `/contact/cards`

Get list of contact cards.

**Query Parameters:**
- `agent` (string) - Agent token for authentication
- `offset` (number, optional) - Offset for pagination
- `limit` (number, optional) - Limit for pagination

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "revision": 123,
    "data": {
      "detailRevision": 123,
      "profileRevision": 123,
      "notifiedProfile": 123,
      "notifiedArticle": 123,
      "notifiedChannel": 123,
      "notifiedView": 123,
      "cardDetail": {
        "status": "confirmed",
        "statusUpdated": 1234567890,
        "token": "string",
        "notes": "string",
        "groups": ["string"]
      },
      "cardProfile": {
        "guid": "string",
        "handle": "string",
        "name": "string",
        "description": "string",
        "location": "string",
        "imageSet": true,
        "seal": "string",
        "version": "string",
        "node": "string"
      }
    }
  }
]
```

### Add Card
**POST** `/contact/cards`

Add a new contact card.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Request Body:**
```json
{
  "message": "string",
  "keyType": "string",
  "publicKey": "string",
  "signatureType": "string",
  "signature": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "revision": 123
}
```

### Remove Card
**DELETE** `/contact/cards/{cardId}`

Remove a contact card.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Response:** `200 OK` - No body on success

---

## Content API

### Get Channels
**GET** `/content/channels`

Get list of channels.

**Query Parameters:**
- `agent` (string) - Agent token for authentication
- `revision` (number, optional) - Starting revision for delta updates
- `types` (string[], optional) - Channel type filters

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "revision": 123,
    "data": {
      "detailRevision": 123,
      "topicRevision": 123,
      "channelSummary": null,
      "channelDetail": {
        "dataType": "sealed",
        "data": "string",
        "created": 1234567890,
        "updated": 1234567890,
        "enableImage": true,
        "enableAudio": true,
        "enableVideo": true,
        "enableBinary": true,
        "contacts": {
          "groups": ["string"],
          "cards": ["string"]
        },
        "members": ["string"]
      }
    }
  }
]
```

### Add Channel
**POST** `/content/channels`

Create a new channel.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Request Body:**
```json
{
  "dataType": "sealed",
  "data": "string",
  "groups": ["string"],
  "cards": ["string"]
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "revision": 123
}
```

### Get Channel Topics
**GET** `/content/channels/{channelId}/topics`

Get topics for a specific channel.

**Query Parameters:**
- `agent` (string) - Agent token for authentication
- `revision` (number, optional) - Starting revision for delta updates
- `marker` (number, optional) - Starting marker for pagination
- `count` (number, optional) - Number of topics to return

**Response:** `200 OK`
```json
{
  "revision": 123,
  "marker": 1234567890,
  "topics": [
    {
      "id": "string",
      "revision": 123,
      "data": {
        "detailRevision": 123,
        "tagRevision": 123,
        "topicDetail": {
          "guid": "string",
          "dataType": "superbasictopic",
          "data": "string",
          "created": 1234567890,
          "updated": 1234567890,
          "status": "confirmed",
          "transform": null
        }
      }
    }
  ]
}
```

### Add Channel Topic
**POST** `/content/channels/{channelId}/topics`

Add a new topic to a channel.

**Query Parameters:**
- `agent` (string) - Agent token for authentication

**Request Body:**
```json
{
  "dataType": "superbasictopic",
  "data": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "revision": 123
}
```

---

## Admin API

### Get Node Status
**GET** `/admin/status`

Get node configuration and status.

**Query Parameters:**
- `token` (string) - Admin token for authentication

**Response:** `200 OK`
```json
{
  "domain": "string",
  "enableImage": true,
  "enableAudio": true,
  "enableVideo": true,
  "enableBinary": true,
  "enableIce": false,
  "iceService": null,
  "iceUrl": null,
  "iceUsername": null,
  "icePassword": null,
  "keyType": "RSA2048",
  "accountStorage": 1073741824,
  "transformSupported": true,
  "allowUnsealed": true,
  "pushSupported": true,
  "enableOpenAccess": false,
  "openAccessLimit": 0
}
```

### Set Node Config
**PUT** `/admin/config`

Update node configuration.

**Query Parameters:**
- `token` (string) - Admin token for authentication

**Request Body:**
```json
{
  "domain": "string",
  "enableImage": true,
  "enableAudio": true,
  "enableVideo": true,
  "enableBinary": true,
  "enableIce": false,
  "iceService": null,
  "iceUrl": null,
  "iceUsername": null,
  "icePassword": null,
  "keyType": "RSA2048",
  "accountStorage": 1073741824,
  "transformSupported": true,
  "allowUnsealed": true,
  "pushSupported": true,
  "enableOpenAccess": false,
  "openAccessLimit": 0
}
```

**Response:** `200 OK` - No body on success

### Get Accounts
**GET** `/admin/accounts`

Get list of accounts on the node.

**Query Parameters:**
- `token` (string) - Admin token for authentication

**Response:** `200 OK`
```json
[
  {
    "accountId": 1,
    "guid": "string",
    "handle": "string",
    "name": "string",
    "description": "string",
    "location": "string",
    "imageSet": true,
    "seal": null,
    "disabled": false,
    "storageUsed": 1234567
  }
]
```

---

## WebSocket API

### Status Stream
**GET** `/status`

Real-time status updates via WebSocket.

**Connection:**
1. Upgrade to WebSocket connection
2. Send initial message:
```json
{
  "appToken": "string"
}
```

**Initial Response:**
```json
{
  "account": 123,
  "profile": 123,
  "article": 123,
  "group": 123,
  "channel": 123,
  "card": 123
}
```

**Status Update Events:**
- `account` - Account revision changed
- `profile` - Profile revision changed
- `card` - Card revision changed
- `channel` - Channel revision changed
- `article` - Article revision changed
- `group` - Group revision changed

### Activity Stream
**GET** `/status?mode=ring`

Real-time activity updates including incoming calls.

**Initial Response:**
```json
{
  "revision": {
    "account": 123,
    "profile": 123,
    "article": 123,
    "group": 123,
    "channel": 123,
    "card": 123
  },
  "phone": {
    "callId": "string",
    "calleeToken": "string",
    "ice": [
      {
        "urls": "stun:stun.example.com:3478",
        "username": "string",
        "credential": "string"
      }
    ],
    "iceUrl": "string",
    "iceUsername": "string",
    "icePassword": "string",
    "cardId": "string"
  }
}
```

---

## Error Responses

### Error Format
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

The API implements rate limiting based on client IP:

- **Default:** 100 requests per minute
- **Retry-After Header:** Sent when limit exceeded, contains seconds until reset
- **Whitelisting:** IPs can be whitelisted to bypass rate limiting
- **Blocking:** IPs exceeding thresholds are automatically blocked

---

## CORS Configuration

The API supports CORS with configurable allowed origins:

1. **Environment Variable:** `DATABAG_WS_ALLOWED_ORIGINS` (comma-separated list)
2. **Database Config:** Falls back to configured domain
3. **Dev Mode:** Set `DATABAG_WS_ORIGIN_STRICT=0` to disable origin validation

---

## Security Headers

All responses include the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
