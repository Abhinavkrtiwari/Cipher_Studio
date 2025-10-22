# Frontend Dockerfile (for static export or Node server)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/ .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
