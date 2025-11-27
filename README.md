# NutriFit – Complete MERN Stack Application

A full-stack recipe recommender application built with React, Node.js, Express, and MongoDB.

## 📁 Project Structure

```
FrontendR/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/               # Express backend API
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Main server file
├── .env.example          # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Configure Environment Variables

**Backend:**
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
```

**Frontend:**
```bash
cd client
# Create .env file with:
# REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Frontend runs on http://localhost:3000

## 🔧 Environment Variables

### Backend (.env in server/)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nutrifit
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key (optional)
```

### Frontend (.env in client/)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 Features

### Core Features
- ✅ User Authentication (Register/Login)
- ✅ JWT Token-based Authentication
- ✅ Protected Routes
- ✅ Recipe Recommendations (AI-powered with Gemini)
- ✅ Recipe Favorites/Saving
- ✅ Pantry Management
- ✅ User Profile Management
- ✅ Recipe Search
- ✅ Trending Recipes
- ✅ Toast Notifications
- ✅ Responsive Design

### Advanced Nutrition Tracking
- ✅ **Meal Logging** - Log breakfast, lunch, dinner, and snacks with detailed nutrition
- ✅ **Calorie Tracking** - Track daily calorie intake vs goals
- ✅ **Macro Tracking** - Monitor protein, carbs, and fats
- ✅ **Daily & Weekly Analytics** - View nutrition trends over time
- ✅ **Personalized Recommendations** - AI-powered suggestions based on eating patterns
- ✅ **Nutrition Insights** - Get personalized insights and recommendations
- ✅ **Quick Add from Recipes** - Add recipes directly to meal log

### Professional Features
- ✅ **Grocery List Generator** - Auto-generate shopping lists from recipes/meal plans
- ✅ **Cost Estimation** - Estimated costs for grocery items
- ✅ **Achievement System** - Gamification with badges and achievements
- ✅ **CSV Export** - Export nutrition and meal data for offline tracking
- ✅ **Meal Tags** - Tag meals (gluten-free, vegan, keto, etc.)
- ✅ **Portion Size Tracking** - Accurate calorie calculation with serving sizes
- ✅ **Dietary Preferences** - Set restrictions, allergies, and preferences
- ✅ **Calorie Goals** - Customizable daily calorie targets
- ✅ **Leaderboard System** - Compete with others, daily & weekly rankings
- ✅ **Privacy Protection** - Usernames masked (first 3 letters + ***)
- ✅ **Meal Planning** - Create and manage weekly meal plans
- ✅ **Smart Scoring** - Points based on goal achievement, streaks, and consistency

## 🛠️ Tech Stack

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB / Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Google Gemini AI

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Recipes
- `GET /api/recipes/trending` - Get trending recipes
- `GET /api/recipes/search?q=query` - Search recipes
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes/favorites` - Save recipe
- `GET /api/recipes/favorites` - Get favorites
- `DELETE /api/recipes/favorites/:id` - Remove favorite

### User
- `POST /api/user/profile` - Update profile
- `GET /api/user/search-history` - Get search history
- `POST /api/user/search-history` - Save search

### Recommendations
- `POST /api/recommend` - Generate AI recipes
- `POST /api/recommend/personalized` - Get personalized recommendations based on eating patterns

### Meals & Nutrition
- `POST /api/meals` - Log a meal
- `GET /api/meals/date/:date` - Get meals for a specific date
- `GET /api/meals/weekly` - Get weekly nutrition summary
- `GET /api/meals/insights` - Get nutrition insights and recommendations
- `PUT /api/meals/:mealId` - Update a meal
- `DELETE /api/meals/:mealId` - Delete a meal

### Grocery Lists
- `POST /api/grocery/generate` - Generate grocery list from recipes/meal plans
- `GET /api/grocery` - Get user's grocery lists
- `GET /api/grocery/:id` - Get single grocery list
- `PUT /api/grocery/:listId/item/:itemId` - Update grocery list item
- `DELETE /api/grocery/:id` - Delete grocery list

### Achievements
- `GET /api/achievements/check` - Check for new achievements
- `GET /api/achievements` - Get user achievements

### Export
- `GET /api/export/nutrition/csv` - Export nutrition data as CSV
- `GET /api/export/meals/csv` - Export meal log as CSV

### Leaderboard
- `GET /api/leaderboard/daily` - Get daily leaderboard
- `GET /api/leaderboard/weekly` - Get weekly leaderboard
- `GET /api/leaderboard/my-rank` - Get user's current rank

### Meal Plans
- `POST /api/meal-plans` - Create a meal plan
- `POST /api/meal-plans/generate` - Auto-generate meal plan
- `GET /api/meal-plans` - Get user's meal plans
- `GET /api/meal-plans/:id` - Get single meal plan
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Water Intake
- `POST /api/water/log` - Log water intake
- `GET /api/water` - Get water intake data

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📦 Production Build

### Frontend
```bash
cd client
npm run build
```

### Backend
```bash
cd server
npm start
```

## 🚢 Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables
2. Deploy server directory
3. Update CORS_ORIGIN

### Frontend (Vercel/Netlify)
1. Set REACT_APP_API_URL
2. Deploy client directory

## 📝 License

MIT © 2025 Joan Ouma

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
