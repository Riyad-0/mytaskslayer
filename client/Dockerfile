# Client Development
FROM node:20-slim AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Client Production Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Server (Static Files)
FROM caddy:2-alpine AS prod
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
