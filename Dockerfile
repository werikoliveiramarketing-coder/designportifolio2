# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
# If you have a custom server.ts, this setup would change, 
# but for a standard SPA (React/Vite), nginx is the best choice.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
