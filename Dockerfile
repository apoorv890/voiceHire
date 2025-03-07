# Use Node.js 18 as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm install && cd ../server && npm install

# Copy source code
COPY client ./client
COPY server ./server

# Copy the server.js file
COPY server.js ./server/

# Explicitly copy .env file to server directory
COPY server/.env ./server/

# Build the frontend
RUN cd client && npm run build

# Create public directory in server and copy frontend build
RUN mkdir -p /app/server/public && \
    cp -r /app/client/dist/* /app/server/public/

# Expose only port 8000
EXPOSE 8000

# Set working directory to server for running the app
WORKDIR /app/server

# Start the server with our custom entry point
CMD ["node", "server.js"]
