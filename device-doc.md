# WhatsApp REST API Documentation

## Daftar Isi
- [Overview](#overview)
- [Setup & Installation](#setup--installation)
- [Authentication](#authentication)
- [Base Configuration](#base-configuration)
- [Rate Limiting](#rate-limiting)
- [WebSocket Integration](#websocket-integration)
- [API Endpoints](#api-endpoints)
  - [Device Management](#device-management)
  - [Session Management](#session-management)
  - [Messaging](#messaging)
  - [Contact Management](#contact-management)
  - [AI Integration](#ai-integration)
  - [Webhook Management](#webhook-management)
  - [Media Handling](#media-handling)
- [Data Schemas](#data-schemas)
- [Error Handling](#error-handling)
- [SDK Examples](#sdk-examples)
- [Troubleshooting](#troubleshooting)
- [Testing Status](#testing-status)

## Overview

WhatsApp REST API yang dibangun dengan Baileys library menyediakan solusi lengkap untuk integrasi WhatsApp Business. API ini mendukung manajemen perangkat, pengiriman pesan, AI chatbot, webhook, dan banyak fitur lainnya.

### Fitur Utama
- ✅ Multi-device support
- ✅ Real-time messaging
- ✅ AI chatbot integration
- ✅ Webhook notifications
- ✅ Media file handling
- ✅ Contact & group management
- ✅ Session persistence
- ✅ QR code authentication

## Setup & Installation

### Prerequisites

```bash
# Node.js version 16+ required
node --version

# Install dependencies
npm install

# Database setup
npm run db:migrate

# Environment configuration
cp .env.example .env
```

### Environment Variables

```env
# Server Configuration
PORT=3000
WS_PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_api
DB_USER=your_username
DB_PASS=your_password

# API Security
API_TOKEN=your_secure_token_here
JWT_SECRET=your_jwt_secret

# AI Integration (Optional)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Media Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10MB

# Webhook Settings
WEBHOOK_SECRET=your_webhook_secret
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# With PM2
pm2 start ecosystem.config.js
```

## Base Configuration

```
API Base URL: http://localhost:3000/api/whatsapp
WebSocket URL: ws://localhost:3001
```

## Authentication

### API Token Authentication

Semua endpoint memerlukan API token di header:

```http
X-API-Token: your_secure_token_here
```

### Device API Key Authentication

Untuk endpoint messaging tertentu:

```http
X-Device-API-Key: device_specific_api_key
```

### JWT Authentication (Coming Soon)

```http
Authorization: Bearer jwt_token_here
```

## Rate Limiting

```
- Per IP: 1000 requests/hour
- Per Device: 100 messages/minute
- Media Upload: 10 files/minute
- QR Code Generation: 5 requests/minute
```

## WebSocket Integration

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001?token=your_api_token');

ws.onopen = () => {
    console.log('Connected to WhatsApp API WebSocket');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
```

### Real-time Events

```javascript
// Event types yang akan diterima
{
    "type": "qr_code",
    "deviceId": "123",
    "data": {
        "qr": "QR_CODE_DATA_HERE",
        "qrImage": "data:image/png;base64,..."
    }
}

{
    "type": "connection_update",
    "deviceId": "123",
    "data": {
        "status": "connected",
        "phoneNumber": "+1234567890"
    }
}

{
    "type": "message_received",
    "deviceId": "123",
    "data": {
        "from": "+1234567890",
        "message": "Hello!",
        "timestamp": "2024-01-01T10:00:00Z"
    }
}
```

## API Endpoints

### Device Management

#### 1. Create Device

Membuat perangkat WhatsApp baru untuk user.

```http
POST /devices
Content-Type: application/json
X-API-Token: your_token

{
    "userId": 123,
    "alias": "My WhatsApp Device",
    "description": "Device for customer support",
    "webhook": {
        "url": "https://your-webhook.com/whatsapp",
        "events": ["message", "connection", "qr"]
    },
    "aiSettings": {
        "enabled": true,
        "autoReply": true,
        "botName": "Support Bot"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Device created successfully",
    "data": {
        "device": {
            "id": "123",
            "userId": 123,
            "sessionId": "user_123_device_my_whatsapp_device",
            "alias": "My WhatsApp Device",
            "description": "Device for customer support",
            "status": "pending",
            "apiKey": "device_api_key_here",
            "phoneNumber": null,
            "isConnected": false,
            "createdAt": "2024-01-01T10:00:00Z",
            "updatedAt": "2024-01-01T10:00:00Z"
        },
        "wsEndpoint": "ws://localhost:3001?token=your_token"
    }
}
```

#### 2. Get User Devices

Mendapatkan semua perangkat milik user.

```http
GET /users/123/devices?page=1&limit=10&status=connected
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "devices": [
            {
                "id": "123",
                "alias": "My WhatsApp Device",
                "status": "connected",
                "phoneNumber": "+1234567890",
                "lastSeen": "2024-01-01T10:00:00Z",
                "messageCount": 150,
                "isConnected": true
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 1,
            "totalPages": 1
        }
    }
}
```

#### 3. Get Device Details

Mendapatkan detail lengkap perangkat.

```http
GET /devices/123
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "device": {
            "id": "123",
            "userId": 123,
            "sessionId": "user_123_device_my_whatsapp_device",
            "alias": "My WhatsApp Device",
            "description": "Device for customer support",
            "status": "connected",
            "phoneNumber": "+1234567890",
            "apiKey": "device_api_key_here",
            "isConnected": true,
            "lastSeen": "2024-01-01T10:00:00Z",
            "createdAt": "2024-01-01T10:00:00Z",
            "updatedAt": "2024-01-01T10:00:00Z",
            "stats": {
                "messagesSent": 150,
                "messagesReceived": 89,
                "uptime": "24h 30m",
                "lastRestart": "2024-01-01T09:00:00Z"
            },
            "webhookSettings": {
                "enabled": true,
                "url": "https://your-webhook.com/whatsapp",
                "events": ["message", "connection", "qr"],
                "lastDelivery": "2024-01-01T10:00:00Z",
                "status": "active"
            },
            "aiSettings": {
                "enabled": true,
                "autoReply": true,
                "botName": "Support Bot",
                "language": "id",
                "maxTokens": 500,
                "temperature": 0.7
            }
        }
    }
}
```

#### 4. Update Device

Memperbarui konfigurasi perangkat.

```http
PUT /devices/123
Content-Type: application/json
X-API-Token: your_token

{
    "alias": "Updated Device Name",
    "description": "Updated description",
    "webhook": {
        "url": "https://new-webhook.com/whatsapp",
        "events": ["message", "connection"]
    },
    "aiSettings": {
        "enabled": false
    }
}
```

#### 5. Delete Device

Menghapus perangkat dan semua data terkait.

```http
DELETE /devices/123
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "message": "Device deleted successfully",
    "data": {
        "deletedDevice": {
            "id": "123",
            "alias": "My WhatsApp Device"
        },
        "cleanedData": {
            "messagesDeleted": 150,
            "contactsDeleted": 45,
            "sessionsDeleted": 1
        }
    }
}
```

### Device Connection Management

#### 1. Connect Device

Memulai koneksi WhatsApp untuk perangkat.

```http
POST /devices/123/connect
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "message": "Connection initiated",
    "data": {
        "deviceId": "123",
        "status": "connecting",
        "qrRequired": true,
        "wsEndpoint": "ws://localhost:3001?token=your_token"
    }
}
```

#### 2. Disconnect Device

Memutuskan koneksi WhatsApp perangkat.

```http
POST /devices/123/disconnect
X-API-Token: your_token
```

#### 3. Relogin Device

Melakukan login ulang perangkat.

```http
POST /devices/123/relogin
X-API-Token: your_token
```

#### 4. Get QR Code

Mendapatkan QR code untuk autentikasi.

```http
GET /devices/123/qr
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "qrCode": "QR_CODE_DATA_HERE",
        "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "expiresAt": "2024-01-01T10:05:00Z",
        "status": "waiting_for_scan"
    }
}
```

### Messaging

#### 1. Send Text Message

Mengirim pesan teks ke kontak.

```http
POST /send
Content-Type: application/json
X-API-Token: your_token

{
    "sessionId": "user_123_device_my_device",
    "recipient": "1234567890@s.whatsapp.net",
    "message": "Hello from WhatsApp API!",
    "options": {
        "quoted": false,
        "linkPreview": true,
        "delay": 0
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Message sent successfully",
    "data": {
        "messageId": "msg_123456789",
        "recipient": "1234567890@s.whatsapp.net",
        "timestamp": "2024-01-01T10:00:00Z",
        "status": "sent",
        "messageType": "text"
    }
}
```

#### 2. Send Message via Device API Key

Mengirim pesan menggunakan Device API Key.

```http
POST /device/send
Content-Type: application/json
X-API-Token: your_token
X-Device-API-Key: device_api_key_here

{
    "recipient": "1234567890@s.whatsapp.net",
    "message": "Hello via device API key!",
    "type": "text",
    "options": {
        "quoted": false,
        "linkPreview": true
    }
}
```

#### 3. Send Template Message

Mengirim pesan template dengan variabel.

```http
POST /send/template
Content-Type: application/json
X-API-Token: your_token

{
    "sessionId": "user_123_device_my_device",
    "recipient": "1234567890@s.whatsapp.net",
    "template": {
        "name": "welcome_message",
        "variables": {
            "customer_name": "John Doe",
            "order_id": "12345",
            "amount": "$99.99"
        }
    }
}
```

#### 4. Send Bulk Messages

Mengirim pesan ke multiple kontak.

```http
POST /send/bulk
Content-Type: application/json
X-API-Token: your_token

{
    "sessionId": "user_123_device_my_device",
    "recipients": [
        {
            "phone": "1234567890@s.whatsapp.net",
            "message": "Hello John!",
            "variables": {
                "name": "John"
            }
        },
        {
            "phone": "0987654321@s.whatsapp.net",
            "message": "Hello Jane!",
            "variables": {
                "name": "Jane"
            }
        }
    ],
    "options": {
        "delay": 2000,
        "template": "greeting_template"
    }
}
```

### Media Handling

#### 1. Send Image

Mengirim gambar ke kontak.

```http
POST /send/image
Content-Type: multipart/form-data
X-API-Token: your_token

sessionId: user_123_device_my_device
recipient: 1234567890@s.whatsapp.net
caption: Check out this image!
image: [file_upload]
```

**Response:**
```json
{
    "success": true,
    "message": "Image sent successfully",
    "data": {
        "messageId": "msg_123456789",
        "recipient": "1234567890@s.whatsapp.net",
        "mediaType": "image",
        "fileName": "image.jpg",
        "fileSize": 1024000,
        "timestamp": "2024-01-01T10:00:00Z"
    }
}
```

#### 2. Send Video

```http
POST /send/video
Content-Type: multipart/form-data
X-API-Token: your_token

sessionId: user_123_device_my_device
recipient: 1234567890@s.whatsapp.net
caption: Check out this video!
video: [file_upload]
```

#### 3. Send Document

```http
POST /send/document
Content-Type: multipart/form-data
X-API-Token: your_token

sessionId: user_123_device_my_device
recipient: 1234567890@s.whatsapp.net
fileName: document.pdf
document: [file_upload]
```

#### 4. Send Audio

```http
POST /send/audio
Content-Type: multipart/form-data
X-API-Token: your_token

sessionId: user_123_device_my_device
recipient: 1234567890@s.whatsapp.net
audio: [file_upload]
isVoiceNote: true
```

### Contact Management

#### 1. Get Device Contacts

Mendapatkan daftar kontak perangkat.

```http
GET /devices/123/contacts?page=1&limit=50&search=john&verified=true
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "contacts": [
            {
                "id": "1234567890@s.whatsapp.net",
                "name": "John Doe",
                "notify": "John",
                "verifiedName": "John Doe",
                "imgUrl": "https://profile-pic-url",
                "status": "Available",
                "isWABusiness": false,
                "isEnterprise": false,
                "lastSeen": "2024-01-01T09:30:00Z",
                "isBlocked": false,
                "isMuted": false
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 50,
            "total": 150,
            "totalPages": 3
        }
    }
}
```

#### 2. Get Device Chats

Mendapatkan daftar chat perangkat.

```http
GET /devices/123/chats?page=1&limit=20&unreadOnly=true
X-API-Token: your_token
```

#### 3. Get Device Groups

Mendapatkan daftar grup perangkat.

```http
GET /devices/123/groups?page=1&limit=20&adminOnly=true
X-API-Token: your_token
```

#### 4. Live Contacts Fetch

Mengambil kontak langsung dari WhatsApp.

```http
GET /devices/123/contacts/live
X-API-Token: your_token
```

### AI Integration

#### 1. Get AI Settings

Mendapatkan pengaturan AI untuk perangkat.

```http
GET /devices/123/settings/ai
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "aiSettings": {
            "enabled": true,
            "autoReply": true,
            "botName": "Support Bot",
            "language": "id",
            "maxTokens": 500,
            "temperature": 0.7,
            "model": "gpt-3.5-turbo",
            "systemPrompt": "You are a helpful customer support assistant.",
            "triggerKeywords": ["help", "support", "bantuan"],
            "excludeGroups": true,
            "workingHours": {
                "enabled": true,
                "timezone": "Asia/Jakarta",
                "start": "09:00",
                "end": "17:00",
                "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
            },
            "autoResponses": [
                {
                    "trigger": "hello",
                    "response": "Hello! How can I help you today?"
                }
            ]
        }
    }
}
```

#### 2. Update AI Settings

Memperbarui pengaturan AI.

```http
PUT /devices/123/settings/ai
Content-Type: application/json
X-API-Token: your_token

{
    "enabled": true,
    "autoReply": true,
    "botName": "Customer Support Bot",
    "language": "id",
    "maxTokens": 1000,
    "temperature": 0.8,
    "model": "gpt-4",
    "systemPrompt": "You are a helpful customer support assistant for an e-commerce platform.",
    "triggerKeywords": ["help", "support", "bantuan", "info"],
    "excludeGroups": true,
    "workingHours": {
        "enabled": true,
        "timezone": "Asia/Jakarta",
        "start": "08:00",
        "end": "20:00",
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    },
    "autoResponses": [
        {
            "trigger": "hello",
            "response": "Halo! Ada yang bisa saya bantu?"
        },
        {
            "trigger": "price",
            "response": "Untuk informasi harga, silakan kunjungi website kami atau hubungi sales team."
        }
    ]
}
```

### Webhook Management

#### 1. Get Webhook Settings

```http
GET /devices/123/settings/webhook
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "webhookSettings": {
            "enabled": true,
            "url": "https://your-webhook.com/whatsapp",
            "events": ["message", "connection", "qr", "media"],
            "secret": "webhook_secret_here",
            "retryCount": 3,
            "timeout": 30000,
            "lastDelivery": "2024-01-01T10:00:00Z",
            "status": "active",
            "headers": {
                "Authorization": "Bearer your_token",
                "Content-Type": "application/json"
            },
            "statistics": {
                "totalSent": 1250,
                "successful": 1200,
                "failed": 50,
                "lastFailure": "2024-01-01T09:00:00Z"
            }
        }
    }
}
```

#### 2. Update Webhook Settings

```http
PUT /devices/123/settings/webhook
Content-Type: application/json
X-API-Token: your_token

{
    "enabled": true,
    "url": "https://new-webhook.com/whatsapp",
    "events": ["message", "connection", "qr", "media", "status"],
    "secret": "new_webhook_secret",
    "retryCount": 5,
    "timeout": 45000,
    "headers": {
        "Authorization": "Bearer new_token",
        "X-Custom-Header": "custom_value"
    }
}
```

#### 3. Test Webhook

Mengirim test payload ke webhook URL.

```http
POST /devices/123/settings/webhook/test
Content-Type: application/json
X-API-Token: your_token

{
    "testPayload": {
        "type": "test",
        "message": "This is a test webhook payload",
        "timestamp": "2024-01-01T10:00:00Z"
    }
}
```

### Session Management

#### 1. Get All Sessions

```http
GET /sessions?page=1&limit=20&status=active
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "sessions": [
            {
                "sessionId": "user_123_device_my_device",
                "deviceId": "123",
                "userId": 123,
                "status": "connected",
                "phoneNumber": "+1234567890",
                "startedAt": "2024-01-01T08:00:00Z",
                "lastActivity": "2024-01-01T10:00:00Z",
                "messageCount": 150,
                "uptime": "2h 30m"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 5,
            "totalPages": 1
        }
    }
}
```

#### 2. Cancel Session

```http
POST /sessions/user_123_device_my_device/cancel
X-API-Token: your_token
```

### Message Retrieval

#### 1. Get All Messages

```http
GET /messages?page=1&limit=50&dateFrom=2024-01-01&dateTo=2024-01-31&type=text&status=sent
X-API-Token: your_token
```

**Response:**
```json
{
    "success": true,
    "data": {
        "messages": [
            {
                "id": "msg_123456789",
                "deviceId": "123",
                "sessionId": "user_123_device_my_device",
                "direction": "outgoing",
                "from": "123456789@s.whatsapp.net",
                "to": "987654321@s.whatsapp.net",
                "type": "text",
                "content": "Hello from WhatsApp API!",
                "timestamp": "2024-01-01T10:00:00Z",
                "status": "delivered",
                "readAt": "2024-01-01T10:05:00Z",
                "metadata": {
                    "messageId": "msg_123456789",
                    "quoted": null,
                    "forwarded": false,
                    "fromMe": true
                }
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 50,
            "total": 1250,
            "totalPages": 25
        },
        "statistics": {
            "totalMessages": 1250,
            "sentMessages": 800,
            "receivedMessages": 450,
            "mediaMessages": 120,
            "textMessages": 1130
        }
    }
}
```

#### 2. Get User Messages

```http
GET /users/123/messages?page=1&limit=50&contactId=1234567890@s.whatsapp.net
X-API-Token: your_token
```

#### 3. Get Device Messages for Contact

```http
GET /devices/123/messages/1234567890@s.whatsapp.net?page=1&limit=50
X-API-Token: your_token
```

## Data Schemas

### Device Schema

```json
{
    "id": "string",
    "userId": "number",
    "sessionId": "string",
    "alias": "string",
    "description": "string|null",
    "status": "pending|connecting|connected|disconnected|error",
    "phoneNumber": "string|null",
    "apiKey": "string",
    "isConnected": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "lastSeen": "string (ISO 8601)|null",
    "stats": {
        "messagesSent": "number",
        "messagesReceived": "number",
        "uptime": "string",
        "lastRestart": "string (ISO 8601)"
    },
    "webhookSettings": "WebhookSettings",
    "aiSettings": "AISettings"
}
```

### Message Schema

```json
{
    "id": "string",
    "deviceId": "string",
    "sessionId": "string",
    "direction": "incoming|outgoing",
    "from": "string",
    "to": "string", 
    "type": "text|image|video|audio|document|sticker|location|contact",
    "content": "string",
    "mediaUrl": "string|null",
    "caption": "string|null",
    "timestamp": "string (ISO 8601)",
    "status": "pending|sent|delivered|read|failed",
    "readAt": "string (ISO 8601)|null",
    "metadata": {
        "messageId": "string",
        "quoted": "QuotedMessage|null",
        "forwarded": "boolean",
        "fromMe": "boolean",
        "broadcast": "boolean"
    }
}
```

### Webhook Payload Schema

```json
{
    "event": "string",
    "deviceId": "string",
    "timestamp": "string (ISO 8601)",
    "data": "object",
    "signature": "string"
}
```

## Error Handling

### Standard Error Response

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable error message",
        "details": "Additional error details if available",
        "timestamp": "2024-01-01T10:00:00Z",
        "requestId": "req_123456789"
    }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_API_TOKEN` | Invalid or missing API token | 401 |
| `DEVICE_NOT_FOUND` | Device ID not found | 404 |
| `DEVICE_NOT_CONNECTED` | Device is not connected | 400 |
| `INVALID_PHONE_NUMBER` | Invalid phone number format | 400 |
| `MESSAGE_SEND_FAILED` | Failed to send message | 500 |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | 429 |
| `INVALID_MEDIA_TYPE` | Unsupported media type | 400 |
| `FILE_TOO_LARGE` | File size exceeds limit | 413 |
| `WEBHOOK_DELIVERY_FAILED` | Webhook delivery failed | 500 |
| `AI_SERVICE_UNAVAILABLE` | AI service is unavailable | 503 |
| `SESSION_EXPIRED` | Session has expired | 401 |
| `INVALID_QR_CODE` | QR code is invalid or expired | 400 |

### Error Handling Best Practices

```javascript
// Example error handling
try {
    const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Token': 'your_token'
        },
        body: JSON.stringify({
            sessionId: 'user_123_device_my_device',
            recipient: '1234567890@s.whatsapp.net',
            message: 'Hello!'
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`API Error: ${data.error.message}`);
    }

    console.log('Message sent:', data.data);
} catch (error) {
    console.error('Error sending message:', error.message);
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
class WhatsAppAPI {
    constructor(apiToken, baseUrl = 'http://localhost:3000/api/whatsapp') {
        this.apiToken = apiToken;
        this.baseUrl = baseUrl;
    }

    async createDevice(userId, alias, options = {}) {
        const response = await fetch(`${this.baseUrl}/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Token': this.apiToken
            },
            body: JSON.stringify({
                userId,
                alias,
                ...options
            })
        });

        return await response.json();
    }

    async sendMessage(sessionId, recipient, message, options = {}) {
        const response = await fetch(`${this.baseUrl}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Token': this.apiToken
            },
            body: JSON.stringify({
                sessionId,
                recipient,
                message,
                options
            })
        });

        return await response.json();
    }

    async getDevices(userId, page = 1, limit = 10) {
        const response = await fetch(
            `${this.baseUrl}/users/${userId}/devices?page=${page}&limit=${limit}`,
            {
                headers: {
                    'X-API-Token': this.apiToken
                }
            }
        );

        return await response.json();
    }

    connectWebSocket(onMessage) {
        const ws = new WebSocket(`ws://localhost:3001?token=${this.apiToken}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        return ws;
    }
}

// Usage
const api = new WhatsAppAPI('your_api_token');

// Create device
const device = await api.createDevice(123, 'My WhatsApp Device');

// Send message
const message = await api.sendMessage(
    device.data.device.sessionId,
    '1234567890@s.whatsapp.net',
    'Hello from API!'
);

// Connect WebSocket
const ws = api.connectWebSocket((data) => {
    console.log('WebSocket message:', data);
});
```

### Python

```python
import requests
import json
import websocket

class WhatsAppAPI:
    def __init__(self, api_token, base_url='http://localhost:3000/api/whatsapp'):
        self.api_token = api_token
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Token': api_token
        }

    def create_device(self, user_id, alias, **options):
        payload = {
            'userId': user_id,
            'alias': alias,
            **options
        }
        
        response = requests.post(
            f'{self.base_url}/devices',
            headers=self.headers,
            json=payload
        )
        
        return response.json()

    def send_message(self, session_id, recipient, message, **options):
        payload = {
            'sessionId': session_id,
            'recipient': recipient,
            'message': message,
            'options': options
        }
        
        response = requests.post(
            f'{self.base_url}/send',
            headers=self.headers,
            json=payload
        )
        
        return response.json()

    def get_devices(self, user_id, page=1, limit=10):
        params = {'page': page, 'limit': limit}
        
        response = requests.get(
            f'{self.base_url}/users/{user_id}/devices',
            headers={'X-API-Token': self.api_token},
            params=params
        )
        
        return response.json()

    def connect_websocket(self, on_message):
        def on_ws_message(ws, message):
            data = json.loads(message)
            on_message(data)

        ws = websocket.create_connection(
            f'ws://localhost:3001?token={self.api_token}'
        )
        
        ws.on_message = on_ws_message
        return ws

# Usage
api = WhatsAppAPI('your_api_token')

# Create device
device = api.create_device(123, 'My WhatsApp Device')

# Send message
message = api.send_message(
    device['data']['device']['sessionId'],
    '1234567890@s.whatsapp.net',
    'Hello from Python API!'
)

print(f"Message sent: {message}")
```

### PHP

```php
<?php

class WhatsAppAPI {
    private $apiToken;
    private $baseUrl;

    public function __construct($apiToken, $baseUrl = 'http://localhost:3000/api/whatsapp') {
        $this->apiToken = $apiToken;
        $this->baseUrl = $baseUrl;
    }

    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $options = [
            'http' => [
                'method' => $method,
                'header' => [
                    'Content-Type: application/json',
                    'X-API-Token: ' . $this->apiToken
                ]
            ]
        ];

        if ($data) {
            $options['http']['content'] = json_encode($data);
        }

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        
        return json_decode($result, true);
    }

    public function createDevice($userId, $alias, $options = []) {
        $data = array_merge([
            'userId' => $userId,
            'alias' => $alias
        ], $options);

        return $this->makeRequest('POST', '/devices', $data);
    }

    public function sendMessage($sessionId, $recipient, $message, $options = []) {
        $data = [
            'sessionId' => $sessionId,
            'recipient' => $recipient,
            'message' => $message,
            'options' => $options
        ];

        return $this->makeRequest('POST', '/send', $data);
    }

    public function getDevices($userId, $page = 1, $limit = 10) {
        $endpoint = "/users/{$userId}/devices?page={$page}&limit={$limit}";
        return $this->makeRequest('GET', $endpoint);
    }
}

// Usage
$api = new WhatsAppAPI('your_api_token');

// Create device
$device = $api->createDevice(123, 'My WhatsApp Device');

// Send message
$message = $api->sendMessage(
    $device['data']['device']['sessionId'],
    '1234567890@s.whatsapp.net',
    'Hello from PHP API!'
);

echo "Message sent: " . json_encode($message);
?>
```

## Troubleshooting

### Common Issues

#### 1. Device Not Connecting

**Problem:** Device status stuck at "connecting"

**Solutions:**
- Check if QR code is being scanned properly
- Verify device is not already connected elsewhere
- Try relogin endpoint
- Check WebSocket connection

```bash
# Check device status
curl -X GET "http://localhost:3000/api/whatsapp/devices/123" \
  -H "X-API-Token: your_token"

# Force relogin
curl -X POST "http://localhost:3000/api/whatsapp/devices/123/relogin" \
  -H "X-API-Token: your_token"
```

#### 2. Messages Not Sending

**Problem:** Messages return success but not delivered

**Solutions:**
- Verify recipient phone number format
- Check device connection status
- Ensure recipient is on WhatsApp
- Check rate limits

```bash
# Check message status
curl -X GET "http://localhost:3000/api/whatsapp/messages?messageId=msg_123" \
  -H "X-API-Token: your_token"
```

#### 3. Webhook Not Receiving Events

**Problem:** Webhook URL not receiving events

**Solutions:**
- Verify webhook URL is accessible
- Check webhook settings
- Test webhook endpoint
- Verify SSL certificate

```bash
# Test webhook
curl -X POST "http://localhost:3000/api/whatsapp/devices/123/settings/webhook/test" \
  -H "X-API-Token: your_token" \
  -H "Content-Type: application/json" \
  -d '{"testPayload": {"type": "test"}}'
```

#### 4. AI Auto-Reply Not Working

**Problem:** AI bot not responding to messages

**Solutions:**
- Check AI settings are enabled
- Verify API keys are set
- Check working hours configuration
- Review trigger keywords

```bash
# Check AI settings
curl -X GET "http://localhost:3000/api/whatsapp/devices/123/settings/ai" \
  -H "X-API-Token: your_token"
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX idx_messages_device_timestamp ON messages(device_id, timestamp);
CREATE INDEX idx_messages_recipient ON messages(recipient);
CREATE INDEX idx_devices_user_status ON devices(user_id, status);
```

#### 2. Rate Limiting Configuration

```javascript
// Adjust rate limits based on your needs
const rateLimits = {
    global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000 // requests per window
    },
    messaging: {
        windowMs: 60 * 1000, // 1 minute
        max: 20 // messages per minute
    },
    media: {
        windowMs: 60 * 1000, // 1 minute
        max: 5 // media uploads per minute
    }
};
```

#### 3. Caching Strategy

```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache device status
await client.setex(`device:${deviceId}:status`, 300, status);

// Cache contact list
await client.setex(`device:${deviceId}:contacts`, 600, JSON.stringify(contacts));
```

### Monitoring & Logging

#### 1. Health Check Endpoint

```http
GET /health
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T10:00:00Z",
    "version": "1.0.0",
    "uptime": "24h 30m",
    "services": {
        "database": "connected",
        "redis": "connected",
        "websocket": "active"
    },
    "statistics": {
        "activeDevices": 15,
        "totalMessages": 1250,
        "messagesPerMinute": 5.2
    }
}
```

#### 2. Logging Configuration

```javascript
// Winston logging configuration
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
```

## SDK Examples

### JavaScript/Node.js

```javascript
class WhatsAppAPI {
    constructor(apiToken, baseUrl = 'http://localhost:3000/api/whatsapp') {
        this.apiToken = apiToken;
        this.baseUrl = baseUrl;
    }

    // Helper method untuk request
    async _request(method, endpoint, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Token': this.apiToken
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        return await response.json();
    }

    // Device Management
    async createDevice(userId, alias, options = {}) {
        return await this._request('POST', '/devices', {
            userId,
            alias,
            ...options
        });
    }

    async getDevice(deviceId) {
        return await this._request('GET', `/devices/${deviceId}`);
    }

    async getUserDevices(userId, page = 1, limit = 10) {
        return await this._request('GET', `/users/${userId}/devices?page=${page}&limit=${limit}`);
    }

    async updateDevice(deviceId, updates) {
        return await this._request('PUT', `/devices/${deviceId}`, updates);
    }

    async deleteDevice(deviceId) {
        return await this._request('DELETE', `/devices/${deviceId}`);
    }

    // Connection Management
    async connectDevice(deviceId) {
        return await this._request('POST', `/devices/${deviceId}/connect`);
    }

    async disconnectDevice(deviceId) {
        return await this._request('POST', `/devices/${deviceId}/disconnect`);
    }

    async getQRCode(deviceId) {
        return await this._request('GET', `/devices/${deviceId}/qr`);
    }

    // Messaging
    async sendMessage(sessionId, recipient, message, options = {}) {
        return await this._request('POST', '/send', {
            sessionId,
            recipient,
            message,
            options
        });
    }

    async sendBulkMessage(sessionId, recipients, options = {}) {
        return await this._request('POST', '/send/bulk', {
            sessionId,
            recipients,
            options
        });
    }

    // Media
    async sendImage(sessionId, recipient, imageFile, caption = '') {
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('recipient', recipient);
        formData.append('caption', caption);
        formData.append('image', imageFile);

        const response = await fetch(`${this.baseUrl}/send/image`, {
            method: 'POST',
            headers: {
                'X-API-Token': this.apiToken
            },
            body: formData
        });

        return await response.json();
    }

    // AI Settings
    async getAISettings(deviceId) {
        return await this._request('GET', `/devices/${deviceId}/settings/ai`);
    }

    async updateAISettings(deviceId, settings) {
        return await this._request('PUT', `/devices/${deviceId}/settings/ai`, settings);
    }

    // Webhook Settings
    async getWebhookSettings(deviceId) {
        return await this._request('GET', `/devices/${deviceId}/settings/webhook`);
    }

    async updateWebhookSettings(deviceId, settings) {
        return await this._request('PUT', `/devices/${deviceId}/settings/webhook`, settings);
    }

    // WebSocket Connection
    connectWebSocket(onMessage, onError = null) {
        const ws = new WebSocket(`ws://localhost:3001?token=${this.apiToken}`);
        
        ws.onopen = () => {
            console.log('Connected to WhatsApp API WebSocket');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (onError) onError(error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return ws;
    }
}

// Usage Example
const api = new WhatsAppAPI('your_api_token');

// Create device
const device = await api.createDevice(123, 'My WhatsApp Device', {
    description: 'Device for customer support',
    webhook: {
        url: 'https://your-webhook.com/whatsapp',
        events: ['message', 'connection']
    }
});

// Send message
const message = await api.sendMessage(
    device.data.device.sessionId,
    '1234567890@s.whatsapp.net',
    'Hello from API!'
);

// Connect WebSocket for real-time updates
const ws = api.connectWebSocket((data) => {
    console.log('Received:', data);
    
    if (data.type === 'qr_code') {
        console.log('QR Code received for device:', data.deviceId);
        // Display QR code to user
    }
    
    if (data.type === 'message_received') {
        console.log('New message:', data.data.message);
        // Process incoming message
    }
});
```

### Python

```python
import requests
import json
import websocket
import threading
from typing import Dict, List, Optional, Callable

class WhatsAppAPI:
    def __init__(self, api_token: str, base_url: str = 'http://localhost:3000/api/whatsapp'):
        self.api_token = api_token
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Token': api_token
        }

    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        url = f'{self.base_url}{endpoint}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers={'X-API-Token': self.api_token})
            elif method == 'POST':
                response = requests.post(url, headers=self.headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, headers=self.headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers={'X-API-Token': self.api_token})
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': str(e)}

    # Device Management
    def create_device(self, user_id: int, alias: str, **options) -> Dict:
        payload = {
            'userId': user_id,
            'alias': alias,
            **options
        }
        return self._request('POST', '/devices', payload)

    def get_device(self, device_id: str) -> Dict:
        return self._request('GET', f'/devices/{device_id}')

    def get_user_devices(self, user_id: int, page: int = 1, limit: int = 10) -> Dict:
        return self._request('GET', f'/users/{user_id}/devices?page={page}&limit={limit}')

    def update_device(self, device_id: str, updates: Dict) -> Dict:
        return self._request('PUT', f'/devices/{device_id}', updates)

    def delete_device(self, device_id: str) -> Dict:
        return self._request('DELETE', f'/devices/{device_id}')

    # Connection Management
    def connect_device(self, device_id: str) -> Dict:
        return self._request('POST', f'/devices/{device_id}/connect')

    def disconnect_device(self, device_id: str) -> Dict:
        return self._request('POST', f'/devices/{device_id}/disconnect')

    def get_qr_code(self, device_id: str) -> Dict:
        return self._request('GET', f'/devices/{device_id}/qr')

    # Messaging
    def send_message(self, session_id: str, recipient: str, message: str, **options) -> Dict:
        payload = {
            'sessionId': session_id,
            'recipient': recipient,
            'message': message,
            'options': options
        }
        return self._request('POST', '/send', payload)

    def send_bulk_message(self, session_id: str, recipients: List[Dict], **options) -> Dict:
        payload = {
            'sessionId': session_id,
            'recipients': recipients,
            'options': options
        }
        return self._request('POST', '/send/bulk', payload)

    # Media
    def send_image(self, session_id: str, recipient: str, image_path: str, caption: str = '') -> Dict:
        url = f'{self.base_url}/send/image'
        
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {
                'sessionId': session_id,
                'recipient': recipient,
                'caption': caption
            }
            
            response = requests.post(
                url,
                headers={'X-API-Token': self.api_token},
                data=data,
                files=files
            )
            
            return response.json()

    # AI Settings
    def get_ai_settings(self, device_id: str) -> Dict:
        return self._request('GET', f'/devices/{device_id}/settings/ai')

    def update_ai_settings(self, device_id: str, settings: Dict) -> Dict:
        return self._request('PUT', f'/devices/{device_id}/settings/ai', settings)

    # Webhook Settings
    def get_webhook_settings(self, device_id: str) -> Dict:
        return self._request('GET', f'/devices/{device_id}/settings/webhook')

    def update_webhook_settings(self, device_id: str, settings: Dict) -> Dict:
        return self._request('PUT', f'/devices/{device_id}/settings/webhook', settings)

    # WebSocket Connection
    def connect_websocket(self, on_message: Callable, on_error: Optional[Callable] = None):
        def on_ws_message(ws, message):
            data = json.loads(message)
            on_message(data)

        def on_ws_error(ws, error):
            print(f"WebSocket error: {error}")
            if on_error:
                on_error(error)

        def on_ws_close(ws, close_status_code, close_msg):
            print("WebSocket connection closed")

        def on_ws_open(ws):
            print("Connected to WhatsApp API WebSocket")

        ws_url = f'ws://localhost:3001?token={self.api_token}'
        ws = websocket.WebSocketApp(
            ws_url,
            on_message=on_ws_message,
            on_error=on_ws_error,
            on_close=on_ws_close,
            on_open=on_ws_open
        )

        # Run WebSocket in separate thread
        ws_thread = threading.Thread(target=ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()

        return ws

# Usage Example
api = WhatsAppAPI('your_api_token')

# Create device
device = api.create_device(123, 'My WhatsApp Device', 
    description='Device for customer support',
    webhook={
        'url': 'https://your-webhook.com/whatsapp',
        'events': ['message', 'connection']
    }
)

# Send message
if device['success']:
    session_id = device['data']['device']['sessionId']
    message = api.send_message(
        session_id,
        '1234567890@s.whatsapp.net',
        'Hello from Python API!'
    )
    print(f"Message sent: {message}")

# WebSocket connection
def handle_message(data):
    print(f"Received: {data}")
    
    if data['type'] == 'qr_code':
        print(f"QR Code received for device: {data['deviceId']}")
        # Save QR code image
        
    if data['type'] == 'message_received':
        print(f"New message: {data['data']['message']}")
        # Process incoming message

ws = api.connect_websocket(handle_message)
```

### PHP

```php
<?php

class WhatsAppAPI {
    private $apiToken;
    private $baseUrl;

    public function __construct($apiToken, $baseUrl = 'http://localhost:3000/api/whatsapp') {
        $this->apiToken = $apiToken;
        $this->baseUrl = $baseUrl;
    }

    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Content-Type: application/json',
            'X-API-Token: ' . $this->apiToken
        ];

        $options = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers)
            ]
        ];

        if ($data && in_array($method, ['POST', 'PUT'])) {
            $options['http']['content'] = json_encode($data);
        }

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        
        if ($result === false) {
            throw new Exception("Request failed: " . error_get_last()['message']);
        }
        
        return json_decode($result, true);
    }

    // Device Management
    public function createDevice($userId, $alias, $options = []) {
        $data = array_merge([
            'userId' => $userId,
            'alias' => $alias
        ], $options);

        return $this->makeRequest('POST', '/devices', $data);
    }

    public function getDevice($deviceId) {
        return $this->makeRequest('GET', "/devices/{$deviceId}");
    }

    public function getUserDevices($userId, $page = 1, $limit = 10) {
        $endpoint = "/users/{$userId}/devices?page={$page}&limit={$limit}";
        return $this->makeRequest('GET', $endpoint);
    }

    public function updateDevice($deviceId, $updates) {
        return $this->makeRequest('PUT', "/devices/{$deviceId}", $updates);
    }

    public function deleteDevice($deviceId) {
        return $this->makeRequest('DELETE', "/devices/{$deviceId}");
    }

    // Connection Management
    public function connectDevice($deviceId) {
        return $this->makeRequest('POST', "/devices/{$deviceId}/connect");
    }

    public function disconnectDevice($deviceId) {
        return $this->makeRequest('POST', "/devices/{$deviceId}/disconnect");
    }

    public function getQRCode($deviceId) {
        return $this->makeRequest('GET', "/devices/{$deviceId}/qr");
    }

    // Messaging
    public function sendMessage($sessionId, $recipient, $message, $options = []) {
        $data = [
            'sessionId' => $sessionId,
            'recipient' => $recipient,
            'message' => $message,
            'options' => $options
        ];

        return $this->makeRequest('POST', '/send', $data);
    }

    public function sendBulkMessage($sessionId, $recipients, $options = []) {
        $data = [
            'sessionId' => $sessionId,
            'recipients' => $recipients,
            'options' => $options
        ];

        return $this->makeRequest('POST', '/send/bulk', $data);
    }

    // Media
    public function sendImage($sessionId, $recipient, $imagePath, $caption = '') {
        $url = $this->baseUrl . '/send/image';
        
        $postData = [
            'sessionId' => $sessionId,
            'recipient' => $recipient,
            'caption' => $caption,
            'image' => new CURLFile($imagePath)
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-API-Token: ' . $this->apiToken
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result, true);
    }

    // AI Settings
    public function getAISettings($deviceId) {
        return $this->makeRequest('GET', "/devices/{$deviceId}/settings/ai");
    }

    public function updateAISettings($deviceId, $settings) {
        return $this->makeRequest('PUT', "/devices/{$deviceId}/settings/ai", $settings);
    }

    // Webhook Settings
    public function getWebhookSettings($deviceId) {
        return $this->makeRequest('GET', "/devices/{$deviceId}/settings/webhook");
    }

    public function updateWebhookSettings($deviceId, $settings) {
        return $this->makeRequest('PUT', "/devices/{$deviceId}/settings/webhook", $settings);
    }
}

// Usage Example
try {
    $api = new WhatsAppAPI('your_api_token');

    // Create device
    $device = $api->createDevice(123, 'My WhatsApp Device', [
        'description' => 'Device for customer support',
        'webhook' => [
            'url' => 'https://your-webhook.com/whatsapp',
            'events' => ['message', 'connection']
        ]
    ]);

    if ($device['success']) {
        $sessionId = $device['data']['device']['sessionId'];
        
        // Send message
        $message = $api->sendMessage(
            $sessionId,
            '1234567890@s.whatsapp.net',
            'Hello from PHP API!'
        );

        echo "Message sent: " . json_encode($message) . "\n";

        // Get QR code
        $qr = $api->getQRCode($device['data']['device']['id']);
        if ($qr['success']) {
            echo "QR Code: " . $qr['data']['qrCode'] . "\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "os"
    "path/filepath"
)

type WhatsAppAPI struct {
    APIToken string
    BaseURL  string
    Client   *http.Client
}

type APIResponse struct {
    Success bool        `json:"success"`
    Message string      `json:"message,omitempty"`
    Data    interface{} `json:"data,omitempty"`
    Error   interface{} `json:"error,omitempty"`
}

func NewWhatsAppAPI(apiToken string) *WhatsAppAPI {
    return &WhatsAppAPI{
        APIToken: apiToken,
        BaseURL:  "http://localhost:3000/api/whatsapp",
        Client:   &http.Client{},
    }
}

func (api *WhatsAppAPI) makeRequest(method, endpoint string, data interface{}) (*APIResponse, error) {
    url := api.BaseURL + endpoint
    
    var body io.Reader
    if data != nil {
        jsonData, err := json.Marshal(data)
        if err != nil {
            return nil, err
        }
        body = bytes.NewBuffer(jsonData)
    }

    req, err := http.NewRequest(method, url, body)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Token", api.APIToken)

    resp, err := api.Client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var apiResp APIResponse
    if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
        return nil, err
    }

    return &apiResp, nil
}

// Device Management
func (api *WhatsAppAPI) CreateDevice(userID int, alias string, options map[string]interface{}) (*APIResponse, error) {
    data := map[string]interface{}{
        "userId": userID,
        "alias":  alias,
    }
    
    for k, v := range options {
        data[k] = v
    }

    return api.makeRequest("POST", "/devices", data)
}

func (api *WhatsAppAPI) GetDevice(deviceID string) (*APIResponse, error) {
    return api.makeRequest("GET", "/devices/"+deviceID, nil)
}

func (api *WhatsAppAPI) SendMessage(sessionID, recipient, message string, options map[string]interface{}) (*APIResponse, error) {
    data := map[string]interface{}{
        "sessionId": sessionID,
        "recipient": recipient,
        "message":   message,
        "options":   options,
    }

    return api.makeRequest("POST", "/send", data)
}

func (api *WhatsAppAPI) SendImage(sessionID, recipient, imagePath, caption string) (*APIResponse, error) {
    url := api.BaseURL + "/send/image"

    file, err := os.Open(imagePath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    var b bytes.Buffer
    writer := multipart.NewWriter(&b)

    // Add form fields
    writer.WriteField("sessionId", sessionID)
    writer.WriteField("recipient", recipient)
    writer.WriteField("caption", caption)

    // Add file
    part, err := writer.CreateFormFile("image", filepath.Base(imagePath))
    if err != nil {
        return nil, err
    }
    
    if _, err := io.Copy(part, file); err != nil {
        return nil, err
    }
    
    writer.Close()

    req, err := http.NewRequest("POST", url, &b)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", writer.FormDataContentType())
    req.Header.Set("X-API-Token", api.APIToken)

    resp, err := api.Client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var apiResp APIResponse
    if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
        return nil, err
    }

    return &apiResp, nil
}

// Usage Example
func main() {
    api := NewWhatsAppAPI("your_api_token")

    // Create device
    device, err := api.CreateDevice(123, "My WhatsApp Device", map[string]interface{}{
        "description": "Device for customer support",
        "webhook": map[string]interface{}{
            "url":    "https://your-webhook.com/whatsapp",
            "events": []string{"message", "connection"},
        },
    })

    if err != nil {
        fmt.Printf("Error creating device: %v\n", err)
        return
    }

    if device.Success {
        fmt.Printf("Device created successfully: %+v\n", device.Data)
    } else {
        fmt.Printf("Failed to create device: %+v\n", device.Error)
    }
}
```

## Data Schemas

### Device Schema

```json
{
    "id": "string",
    "userId": "number",
    "sessionId": "string",
    "alias": "string",
    "description": "string|null",
    "status": "pending|connecting|connected|disconnected|error",
    "phoneNumber": "string|null",
    "apiKey": "string",
    "isConnected": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "lastSeen": "string (ISO 8601)|null",
    "stats": {
        "messagesSent": "number",
        "messagesReceived": "number",
        "uptime": "string",
        "lastRestart": "string (ISO 8601)"
    },
    "webhookSettings": "WebhookSettings",
    "aiSettings": "AISettings"
}
```

### Message Schema

```json
{
    "id": "string",
    "deviceId": "string",
    "sessionId": "string",
    "direction": "incoming|outgoing",
    "from": "string",
    "to": "string", 
    "type": "text|image|video|audio|document|sticker|location|contact",
    "content": "string",
    "mediaUrl": "string|null",
    "caption": "string|null",
    "timestamp": "string (ISO 8601)",
    "status": "pending|sent|delivered|read|failed",
    "readAt": "string (ISO 8601)|null",
    "metadata": {
        "messageId": "string",
        "quoted": "QuotedMessage|null",
        "forwarded": "boolean",
        "fromMe": "boolean",
        "broadcast": "boolean"
    }
}
```

### AI Settings Schema

```json
{
    "enabled": "boolean",
    "autoReply": "boolean",
    "botName": "string",
    "language": "string",
    "maxTokens": "number",
    "temperature": "number",
    "model": "string",
    "systemPrompt": "string",
    "triggerKeywords": ["string"],
    "excludeGroups": "boolean",
    "workingHours": {
        "enabled": "boolean",
        "timezone": "string",
        "start": "string (HH:MM)",
        "end": "string (HH:MM)",
        "days": ["string"]
    },
    "autoResponses": [
        {
            "trigger": "string",
            "response": "string"
        }
    ]
}
```

### Webhook Settings Schema

```json
{
    "enabled": "boolean",
    "url": "string",
    "events": ["string"],
    "secret": "string",
    "retryCount": "number",
    "timeout": "number",
    "headers": "object",
    "statistics": {
        "totalSent": "number",
        "successful": "number",
        "failed": "number",
        "lastFailure": "string (ISO 8601)|null"
    }
}
```

### Webhook Payload Schema

```json
{
    "event": "string",
    "deviceId": "string",
    "timestamp": "string (ISO 8601)",
    "data": "object",
    "signature": "string (HMAC-SHA256)"
}
```

## Error Handling

### Standard Error Response

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable error message",
        "details": "Additional error details if available",
        "timestamp": "2024-01-01T10:00:00Z",
        "requestId": "req_123456789"
    }
}
```

### Common Error Codes

| Code | Description | HTTP Status | Solutions |
|------|-------------|-------------|-----------|
| `INVALID_API_TOKEN` | Invalid or missing API token | 401 | Check your API token |
| `DEVICE_NOT_FOUND` | Device ID not found | 404 | Verify device ID exists |
| `DEVICE_NOT_CONNECTED` | Device is not connected | 400 | Connect device first |
| `INVALID_PHONE_NUMBER` | Invalid phone number format | 400 | Use international format |
| `MESSAGE_SEND_FAILED` | Failed to send message | 500 | Check connection status |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | 429 | Slow down requests |
| `INVALID_MEDIA_TYPE` | Unsupported media type | 400 | Check supported formats |
| `FILE_TOO_LARGE` | File size exceeds limit | 413 | Reduce file size |
| `WEBHOOK_DELIVERY_FAILED` | Webhook delivery failed | 500 | Check webhook URL |
| `AI_SERVICE_UNAVAILABLE` | AI service is unavailable | 503 | Try again later |
| `SESSION_EXPIRED` | Session has expired | 401 | Reconnect device |
| `INVALID_QR_CODE` | QR code is invalid or expired | 400 | Generate new QR code |

## Testing Status

### 📊 **Current Testing Status: 23/28 Endpoints (82% Coverage)**

**✅ TESTED & WORKING (23 endpoints):**

- Device Management: 6/6 endpoints ✅
- Session Management: 2/2 endpoints ✅
- Message Retrieval: 3/3 endpoints ✅
- Contact Management: 4/4 endpoints ✅
- Live WhatsApp Data Fetch: 6/6 endpoints ✅
- Alternative Messaging: 2/2 endpoints ✅

**⚠️ REQUIRES CONNECTED DEVICE (5 endpoints):**

- Media Messaging: 3 endpoints (send image/video/document)
- Advanced Features: 2 endpoints (requires live WhatsApp connection)

### Test Commands

```bash
# Test device creation
curl -X POST "http://localhost:3000/api/whatsapp/devices" \
  -H "Content-Type: application/json" \
  -H "X-API-Token: test123" \
  -d '{
    "userId": 123,
    "alias": "Test Device"
  }'

# Test message sending
curl -X POST "http://localhost:3000/api/whatsapp/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Token: test123" \
  -d '{
    "sessionId": "user_123_device_test_device",
    "recipient": "1234567890@s.whatsapp.net",
    "message": "Test message"
  }'

# Test webhook settings
curl -X PUT "http://localhost:3000/api/whatsapp/devices/123/settings/webhook" \
  -H "Content-Type: application/json" \
  -H "X-API-Token: test123" \
  -d '{
    "enabled": true,
    "url": "https://your-webhook.com/whatsapp",
    "events": ["message", "connection"]
  }'
```

---

## Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Basic messaging functionality
- Device management
- WebSocket integration

### v1.1.0 (2024-01-15)
- Added AI integration
- Webhook support
- Media file handling
- Bulk messaging

### v1.2.0 (2024-02-01)
- Enhanced error handling
- Rate limiting
- Performance optimizations
- Comprehensive logging

---

## Support & Contact

- **Documentation**: [API Documentation](https://your-docs-url.com)
- **Support Email**: support@your-domain.com
- **GitHub**: [GitHub Repository](https://github.com/your-repo)
- **Discord**: [Discord Server](https://discord.gg/your-server)

## Contoh Implementasi Webhook

### Webhook Handler (Node.js)

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Webhook handler
app.post('/webhook/whatsapp', (req, res) => {
    const signature = req.headers['x-signature'];
    const payload = JSON.stringify(req.body);
    const secret = process.env.WEBHOOK_SECRET;

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
        return res.status(401).send('Invalid signature');
    }

    const { event, deviceId, data } = req.body;

    switch (event) {
        case 'qr_code':
            console.log(`QR Code for device ${deviceId}:`, data.qr);
            // Save QR code to database or display to user
            break;

        case 'connection_update':
            console.log(`Device ${deviceId} status:`, data.status);
            if (data.status === 'connected') {
                console.log(`Phone number: ${data.phoneNumber}`);
            }
            break;

        case 'message_received':
            console.log(`New message from ${data.from}:`, data.message);
            
            // Auto-reply example
            if (data.message.toLowerCase().includes('hello')) {
                // Send auto-reply (implement your API call here)
                replyToMessage(deviceId, data.from, 'Hello! How can I help you?');
            }
            break;

        case 'message_sent':
            console.log(`Message sent to ${data.to}:`, data.status);
            break;

        case 'media_received':
            console.log(`Media received from ${data.from}:`, data.mediaType);
            // Download and process media file
            break;

        default:
            console.log('Unknown event:', event);
    }

    res.status(200).send('OK');
});

async function replyToMessage(deviceId, recipient, message) {
    try {
        const response = await fetch('http://localhost:3000/api/whatsapp/device/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Token': process.env.API_TOKEN,
                'X-Device-API-Key': process.env.DEVICE_API_KEY
            },
            body: JSON.stringify({
                recipient,
                message,
                type: 'text'
            })
        });

        const result = await response.json();
        console.log('Auto-reply sent:', result);
    } catch (error) {
        console.error('Failed to send auto-reply:', error);
    }
}

app.listen(3000, () => {
    console.log('Webhook server running on port 3000');
});
```

### Webhook Handler (Python Flask)

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import requests
import os

app = Flask(__name__)

@app.route('/webhook/whatsapp', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-Signature')
    payload = request.get_data()
    secret = os.getenv('WEBHOOK_SECRET')

    # Verify signature
    expected_signature = 'sha256=' + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if signature != expected_signature:
        return jsonify({'error': 'Invalid signature'}), 401

    data = request.json
    event = data.get('event')
    device_id = data.get('deviceId')
    event_data = data.get('data')

    if event == 'qr_code':
        print(f"QR Code for device {device_id}: {event_data.get('qr')}")
        # Save QR code to database or display to user
        
    elif event == 'connection_update':
        print(f"Device {device_id} status: {event_data.get('status')}")
        if event_data.get('status') == 'connected':
            print(f"Phone number: {event_data.get('phoneNumber')}")
            
    elif event == 'message_received':
        print(f"New message from {event_data.get('from')}: {event_data.get('message')}")
        
        # Auto-reply example
        if 'hello' in event_data.get('message', '').lower():
            reply_to_message(device_id, event_data.get('from'), 'Hello! How can I help you?')
            
    elif event == 'message_sent':
        print(f"Message sent to {event_data.get('to')}: {event_data.get('status')}")
        
    elif event == 'media_received':
        print(f"Media received from {event_data.get('from')}: {event_data.get('mediaType')}")
        
    return jsonify({'status': 'ok'})

def reply_to_message(device_id, recipient, message):
    try:
        response = requests.post(
            'http://localhost:3000/api/whatsapp/device/send',
            headers={
                'Content-Type': 'application/json',
                'X-API-Token': os.getenv('API_TOKEN'),
                'X-Device-API-Key': os.getenv('DEVICE_API_KEY')
            },
            json={
                'recipient': recipient,
                'message': message,
                'type': 'text'
            }
        )
        
        result = response.json()
        print(f"Auto-reply sent: {result}")
    except Exception as e:
        print(f"Failed to send auto-reply: {e}")

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

## Best Practices

### 1. Security

```javascript
// Always validate API tokens
const validateApiToken = (req, res, next) => {
    const token = req.headers['x-api-token'];
    if (!token || token !== process.env.API_TOKEN) {
        return res.status(401).json({ error: 'Invalid API token' });
    }
    next();
};

// Rate limiting implementation
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP'
});

const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 messages per minute
    message: 'Message rate limit exceeded'
});
```

### 2. Error Handling

```javascript
// Comprehensive error handling
const handleApiError = (error, req, res, next) => {
    console.error('API Error:', error);

    if (error.code === 'DEVICE_NOT_CONNECTED') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'DEVICE_NOT_CONNECTED',
                message: 'Device is not connected to WhatsApp',
                solutions: [
                    'Connect device using /devices/{id}/connect',
                    'Scan QR code if required',
                    'Check device status'
                ]
            }
        });
    }

    if (error.code === 'RATE_LIMIT_EXCEEDED') {
        return res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded',
                retryAfter: error.retryAfter
            }
        });
    }

    // Generic error response
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            requestId: req.id
        }
    });
};
```

### 3. Monitoring & Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

// Log API requests
const logRequests = (req, res, next) => {
    logger.info('API Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
};
```

### 4. Performance Optimization

```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl}`;
        
        try {
            const cached = await client.get(key);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
            
            // Store original send function
            const originalSend = res.json;
            
            // Override send function to cache response
            res.json = function(data) {
                client.setex(key, duration, JSON.stringify(data));
                originalSend.call(this, data);
            };
            
            next();
        } catch (error) {
            next();
        }
    };
};
```

## Deployment Guide

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  whatsapp-api:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_USER=whatsapp
      - DB_PASS=password
      - DB_NAME=whatsapp_api
      - API_TOKEN=your_secure_token
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=whatsapp
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=whatsapp_api
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Configuration

```javascript
// ecosystem.config.js (PM2)
module.exports = {
    apps: [
        {
            name: 'whatsapp-api',
            script: 'server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                WS_PORT: 3001
            },
            error_file: 'logs/err.log',
            out_file: 'logs/out.log',
            log_file: 'logs/combined.log',
            time: true
        }
    ]
};
```

### Nginx Configuration

```nginx
# nginx.conf
upstream whatsapp_api {
    server 127.0.0.1:3000;
}

upstream whatsapp_ws {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    # API endpoints
    location /api/ {
        proxy_pass http://whatsapp_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket endpoints
    location /ws/ {
        proxy_pass http://whatsapp_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## FAQ (Frequently Asked Questions)

### Q: Bagaimana cara menangani multiple device dalam satu aplikasi?

A: Gunakan userId yang berbeda untuk setiap user, dan buat device terpisah untuk masing-masing:

```javascript
// User 1
const device1 = await api.createDevice(123, 'Device User 1');

// User 2
const device2 = await api.createDevice(456, 'Device User 2');
```

### Q: Apakah bisa mengirim pesan ke grup WhatsApp?

A: Ya, gunakan Group ID sebagai recipient:

```javascript
await api.sendMessage(
    sessionId,
    '120363023345678901@g.us', // Group ID format
    'Hello group!'
);
```

### Q: Bagaimana cara mendapatkan Group ID?

A: Gunakan endpoint Get Device Groups:

```bash
curl -X GET "http://localhost:3000/api/whatsapp/devices/123/groups" \
  -H "X-API-Token: your_token"
```

### Q: Bisakah API ini digunakan untuk WhatsApp Business API resmi?

A: Tidak, ini adalah unofficial API menggunakan Baileys. Untuk official WhatsApp Business API, gunakan Meta Business Platform.

### Q: Bagaimana cara backup dan restore session?

A: Session otomatis disimpan di database. Untuk backup manual:

```bash
# Backup database
pg_dump whatsapp_api > backup.sql

# Restore
psql whatsapp_api < backup.sql
```

---

## Support & Contact

- **📧 Email**: support@your-domain.com
- **📱 WhatsApp**: +62-xxx-xxx-xxxx
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)
- **💬 Community**: [Discord Server](https://discord.gg/your-server)
- **📖 Documentation**: [Official Docs](https://your-docs-url.com)
- **🎥 Video Tutorials**: [YouTube Channel](https://youtube.com/your-channel)

### Commercial Support

Untuk dukungan komersial dan enterprise:
- **Custom Development**: Pengembangan fitur khusus
- **SLA Support**: Support dengan Service Level Agreement
- **Training & Consultation**: Pelatihan tim dan konsultasi teknis
- **Dedicated Support**: Tim support khusus untuk enterprise

---

**© 2024 WhatsApp REST API. All rights reserved.**
