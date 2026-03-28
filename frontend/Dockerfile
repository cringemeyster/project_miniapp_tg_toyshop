# Build
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_MASTER_ID

COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY . .

# bake env into build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MASTER_ID=$VITE_MASTER_ID

RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
