FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Set environment for development
ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_PORT=0

# Start the development server
CMD ["npm", "start"]
