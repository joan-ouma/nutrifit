# Build stage for React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy client source and build
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Set node environment to production
ENV NODE_ENV=production

# Copy backend package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy backend source code
COPY server/ ./server/

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/client/build ./client/build

# Expose the API port
EXPOSE 10000

# Start the server (WORKDIR is /app)
CMD ["node", "server/server.js"]
