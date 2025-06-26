# Environment Variables Migration

## Overview
This document summarizes the migration from hardcoded values to environment variables across all controllers and views in the WhatsApp Management System.

## Changes Made

### 1. Controllers Updated
All API controllers now use environment variables instead of hardcoded values:

#### `src/controllers/api/apiDeviceController.js`
- ✅ `WHATSAPP_API_BASE_URL` - Uses `process.env.WHATSAPP_API_URL`
- ✅ `WHATSAPP_API_TOKEN` - Uses `process.env.WHATSAPP_API_TOKEN` 
- ✅ Fixed hardcoded `http://localhost:3000` → `${WHATSAPP_API_BASE_URL}`
- ✅ Fixed hardcoded `'test123'` → `WHATSAPP_API_TOKEN`

#### `src/controllers/api/apiMessageController.js`
- ✅ `WHATSAPP_API_BASE_URL` - Uses `process.env.WHATSAPP_API_URL`
- ✅ `WHATSAPP_API_TOKEN` - Uses `process.env.WHATSAPP_API_TOKEN`
- ✅ Added comprehensive error handling for connection issues
- ✅ Added test connection endpoint for debugging

#### `src/controllers/api/apiFileController.js`
- ✅ `WHATSAPP_API_BASE_URL` - Uses `process.env.WHATSAPP_API_URL`
- ✅ `WHATSAPP_API_TOKEN` - Uses `process.env.WHATSAPP_API_TOKEN`

#### `src/controllers/api/apiWarmerController.js`
- ✅ `WHATSAPP_API_BASE_URL` - Uses `process.env.WHATSAPP_API_URL`
- ✅ `WHATSAPP_API_TOKEN` - Uses `process.env.WHATSAPP_API_TOKEN`

### 2. Views Updated
All EJS templates now use environment variables:

#### `src/views/device.ejs`
- ✅ `API_TOKEN` → `<%= process.env.WHATSAPP_API_TOKEN || "test123" %>`
- ✅ `WS_BASE_URL` → `<%= (process.env.WHATSAPP_WS_URL || "ws://localhost:3001") %>`
- ✅ Removed hardcoded port references in error messages

#### `src/views/device-settings.ejs`
- ✅ `API_TOKEN` → `<%= process.env.WHATSAPP_API_TOKEN || 'test123' %>`

#### `src/views/warmer.ejs`
- ✅ `timezone` → `<%= process.env.TIMEZONE || 'Asia/Jakarta' %>`

#### Root level EJS files:
- ✅ `contoh.ejs` - Updated API_TOKEN, API_BASE_URL, WS_BASE_URL
- ✅ `setting.ejs` - Updated API_TOKEN
- ✅ `file-management.ejs` - Updated API_TOKEN  
- ✅ `warmer.ejs` - Updated timezone

### 3. Environment Variables Configuration

#### Updated `env.example`:
```env
# Application Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL via Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_db"

# Authentication Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="24h"

# Cookie Settings
COOKIE_SECRET="your-cookie-secret-key"

# CORS Settings
CORS_ORIGIN="http://localhost:5000"

# WhatsApp API Configuration
WHATSAPP_API_URL="http://localhost:3000"       # External WhatsApp API HTTP URL
WHATSAPP_WS_URL="ws://localhost:3001"          # External WhatsApp API WebSocket URL  
WHATSAPP_API_TOKEN="test123"                   # API authentication token

# Application Settings
TIMEZONE="Asia/Jakarta"                        # Default timezone
```

## Environment Variables Reference

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `PORT` | `5000` | Application server port |
| `NODE_ENV` | `development` | Node environment |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL database connection string |
| `JWT_SECRET` | Required | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | `24h` | JWT token expiration time |
| `COOKIE_SECRET` | Required | Cookie signing secret |
| `CORS_ORIGIN` | `http://localhost:5000` | CORS allowed origin |
| `WHATSAPP_API_URL` | `http://localhost:3000` | External WhatsApp API base URL |
| `WHATSAPP_WS_URL` | `ws://localhost:3001` | External WhatsApp API WebSocket URL |
| `WHATSAPP_API_TOKEN` | `test123` | External API authentication token |
| `TIMEZONE` | `Asia/Jakarta` | Default application timezone |

## Benefits

1. **Security**: No sensitive values in source code
2. **Flexibility**: Easy to change settings per environment
3. **Deployment**: Simple configuration for different environments
4. **Maintenance**: Centralized configuration management

## Migration Steps for Deployment

1. Copy `env.example` to `.env`
2. Update values in `.env` according to your environment
3. Ensure all required environment variables are set
4. Test with the new configuration

## Notes

- All controllers now use consistent environment variable patterns
- Fallback values are provided for development
- CDN URLs are documented but use defaults (can be customized)
- Production settings are included but commented out 