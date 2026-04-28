FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3019

ENV NODE_ENV=production
ENV PORT=3019
ENV SUPABASE_URL=
ENV SUPABASE_SERVICE_ROLE_KEY=

CMD ["npm", "start"]
