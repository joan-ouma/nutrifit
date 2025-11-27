#!/bin/bash

# NutriSmart Quick Start Script

echo "🚀 Starting NutriSmart Application..."
echo ""

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating from .env.example..."
    cp server/.env.example server/.env
    echo "✅ Please edit server/.env with your MongoDB URI and JWT_SECRET"
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️  client/.env not found. Creating..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
if [ ! -d "server/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Install frontend dependencies
if [ ! -d "client/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Next steps:"
echo "1. Edit server/.env with your MongoDB URI and JWT_SECRET"
echo "2. Start backend: cd server && npm run dev"
echo "3. Start frontend: cd client && npm start"
echo ""
echo "🌐 Backend will run on http://localhost:5000"
echo "🌐 Frontend will run on http://localhost:3000"
echo ""



