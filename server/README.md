# NutriSmart Backend API

Backend server for the NutriSmart recipe recommender application.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Server**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

## 📁 Project Structure

```
server/
├── controllers/       # Route controllers
│   ├── authController.js
│   ├── userController.js
│   └── recipeController.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── models/            # Mongoose models
│   ├── User.js
│   └── Recipe.js
├── routes/            # API routes
│   ├── auth.js
│   ├── user.js
│   ├── recipes.js
│   └── recommend.js
├── .env.example       # Environment variables template
├── .gitignore
├── package.json
├── server.js          # Main server file
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### User
- `POST /api/user/profile` - Update profile (protected)
- `GET /api/user/search-history` - Get search history (protected)
- `POST /api/user/search-history` - Save search (protected)

### Recipes
- `GET /api/recipes/trending` - Get trending recipes
- `GET /api/recipes/search?q=query` - Search recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes/favorites` - Save recipe (protected)
- `GET /api/recipes/favorites` - Get favorites (protected)
- `DELETE /api/recipes/favorites/:id` - Remove favorite (protected)

### Recommendations
- `POST /api/recommend` - Generate AI recipes

## 🔐 Authentication

Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Environment Variables

See `.env.example` for required environment variables:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origins
- `GEMINI_API_KEY` - Google Gemini API key (optional)

## 🧪 Testing

```bash
# Run tests
npm test

# Test endpoints manually
curl http://localhost:5000/health
```

## 📚 Documentation

For detailed API documentation, see the main project README.



