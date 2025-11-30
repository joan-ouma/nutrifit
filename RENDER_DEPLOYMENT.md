# Render Deployment Guide

## Prerequisites
- Render account
- MongoDB database (MongoDB Atlas recommended)
- Google Gemini API key

## Backend Deployment (Server)

### 1. Create a New Web Service on Render

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Select the repository: `joan-ouma/nutrifit`

### 2. Configure Build Settings

- **Name**: `nutrifit-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Environment Variables

Add these environment variables in Render Dashboard:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=https://your-frontend-url.onrender.com,https://your-custom-domain.com
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
```

**Important Notes:**
- `PORT` should be set to `10000` (Render's default) or leave it unset
- `CORS_ORIGIN` should include your frontend URL(s), comma-separated
- `GEMINI_API_KEY` is required for AI recipe generation
- `JWT_SECRET` should be a long random string (use `openssl rand -base64 32`)

### 4. Health Check

The server includes a health check endpoint at `/health`. Render will use this automatically.

### 5. Deploy

Click "Create Web Service" and wait for deployment to complete.

## Frontend Deployment (Client)

### Option 1: Static Site on Render

1. Go to Render Dashboard → New → Static Site
2. Connect your GitHub repository
3. Configure:
   - **Name**: `nutrifit-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### Option 2: Deploy Client Separately

If deploying client separately, update `client/src/config.js`:

```javascript
const DEFAULT_PROD_URL = "https://your-api-url.onrender.com/api";
```

Or set environment variable:
```
REACT_APP_API_URL=https://your-api-url.onrender.com/api
```

## Troubleshooting

### 404 Errors

1. **Check API URL**: Verify `REACT_APP_API_URL` matches your backend URL
2. **Check CORS**: Ensure frontend URL is in `CORS_ORIGIN`
3. **Check Routes**: Verify routes are correctly mounted in `server.js`

### AI Chat Generating Fallback Recipes

1. **Check GEMINI_API_KEY**: 
   - Verify it's set in Render environment variables
   - Check server logs for "GEMINI_API_KEY: ✅ Set" or "❌ Missing"
   
2. **Check API Response**:
   - Open browser console and check Network tab
   - Look for `/api/recommend` requests
   - Check response status and error messages

3. **Common Issues**:
   - Missing API key → Server returns 500 error
   - Invalid API key → Gemini API returns error
   - Network issues → Request fails with 404 or timeout

### Debugging Steps

1. **Check Server Logs**:
   ```bash
   # In Render Dashboard → Logs
   # Look for:
   # - "🚀 Server running on port..."
   # - "✅ MongoDB connected successfully"
   # - "🔑 GEMINI_API_KEY: ✅ Set"
   ```

2. **Test Health Endpoint**:
   ```bash
   curl https://your-api-url.onrender.com/health
   ```

3. **Test API Endpoint** (with auth token):
   ```bash
   curl -X POST https://your-api-url.onrender.com/api/recommend \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"pantry": "chicken, tomatoes"}'
   ```

4. **Check Client Console**:
   - Open browser DevTools → Console
   - Look for error messages
   - Check Network tab for failed requests

## Environment Variables Checklist

### Backend (Required)
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `JWT_SECRET` - Secret for JWT tokens
- [ ] `CORS_ORIGIN` - Frontend URL(s)
- [ ] `PORT` - Port number (optional, defaults to 5000)

### Frontend (Optional)
- [ ] `REACT_APP_API_URL` - Backend API URL (auto-detected if not set)

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to Render environment variables

## MongoDB Setup (MongoDB Atlas)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get connection string and add to `MONGO_URI`

## Post-Deployment Checklist

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] User can register/login
- [ ] API endpoints respond correctly
- [ ] AI recipe generation works
- [ ] CORS errors are resolved
- [ ] Environment variables are set correctly

## Support

If issues persist:
1. Check Render logs for errors
2. Verify all environment variables are set
3. Test API endpoints directly with curl/Postman
4. Check browser console for client-side errors

