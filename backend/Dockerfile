# Backend Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

ENV PORT=5000
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]
