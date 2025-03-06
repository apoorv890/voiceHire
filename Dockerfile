# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for both client and server
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for both client and server
RUN cd client && npm install && cd ../server && npm install

# Copy the rest of the client and server files
COPY client ./client
COPY server ./server

# Build the client
RUN cd client && npm run build

# Expose the ports
EXPOSE 3000 5000

# Start both applications (you may need to adjust the commands based on your setup)
CMD ["sh", "-c", "cd server && node index.js & cd client && npm start"]
