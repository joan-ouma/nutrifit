# Backend Changes Summary for NutriSmart

## 🎯 Quick Overview

This document summarizes the key modifications needed in the [NutriSmart backend repository](https://github.com/joan-ouma/NutriSmart) to support the enhanced frontend.

## 📦 New Files to Create

1. **`middleware/auth.js`** - JWT authentication middleware
2. **`middleware/errorHandler.js`** - Centralized error handling
3. **`models/Recipe.js`** - Recipe model for saved recipes
4. **`controllers/recipeController.js`** - Recipe operations controller
5. **`routes/recipes.js`** - Recipe routes

## 🔄 Files to Update

1. **`models/User.js`** - Add `favoriteRecipes` and `searchHistory` fields
2. **`controllers/authController.js`** - Ensure JWT token format, add `getCurrentUser`
3. **`routes/auth.js`** - Add `/me` endpoint
4. **`routes/user.js`** - Protect all routes with auth middleware
5. **`server.js`** - Add new routes, update CORS, add error handler

## 🔑 Key Changes

### 1. Authentication
- ✅ JWT tokens must be returned in `{success, token, user, msg}` format
- ✅ Frontend sends tokens as `Authorization: Bearer <token>`
- ✅ All protected routes need `authMiddleware`

### 2. Error Format
All errors must follow this format:
```json
{
  "success": false,
  "error": "Detailed error message",
  "msg": "User-friendly message"
}
```

### 3. New Endpoints Required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/recipes/favorites` | ✅ | Save recipe |
| GET | `/api/recipes/favorites` | ✅ | Get user favorites |
| DELETE | `/api/recipes/favorites/:id` | ✅ | Remove favorite |
| GET | `/api/recipes/search?q=query` | ❌ | Search recipes |
| GET | `/api/recipes/:id` | ❌ | Get recipe details |

### 4. CORS Configuration
Must allow `Authorization` header:
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // CRITICAL
}));
```

## 📋 Implementation Checklist

- [ ] Install `jsonwebtoken` and `bcryptjs`
- [ ] Create `middleware/auth.js`
- [ ] Create `middleware/errorHandler.js`
- [ ] Create `models/Recipe.js`
- [ ] Update `models/User.js` (add favoriteRecipes)
- [ ] Create `controllers/recipeController.js`
- [ ] Update `controllers/authController.js` (add getCurrentUser)
- [ ] Create `routes/recipes.js`
- [ ] Update `routes/auth.js` (add /me)
- [ ] Update `routes/user.js` (add authMiddleware)
- [ ] Update `server.js` (add routes, CORS, error handler)
- [ ] Update `.env` (ensure JWT_SECRET is set)
- [ ] Test all endpoints

## 🧪 Testing Priority

1. **High Priority:**
   - Login/Register return proper token format
   - Protected routes reject requests without token
   - Protected routes accept valid tokens

2. **Medium Priority:**
   - Recipe saving works
   - Recipe search works
   - Error responses are standardized

3. **Low Priority:**
   - Search history
   - Recipe details

## ⚠️ Common Issues

1. **CORS Errors**: Make sure `Authorization` header is allowed
2. **401 Errors**: Check token format and JWT_SECRET
3. **404 Errors**: Ensure routes are registered in server.js
4. **500 Errors**: Check MongoDB connection and model references

## 📚 Full Documentation

See `BACKEND_IMPLEMENTATION_GUIDE.md` for complete implementation details with code examples.

## 🔗 Frontend Integration

The frontend expects:
- Token in response: `res.data.token`
- User data: `res.data.user`
- Success flag: `res.data.success`
- Error messages: `res.data.msg` or `res.data.error`

All API calls include: `headers: { Authorization: 'Bearer ' + token }`

