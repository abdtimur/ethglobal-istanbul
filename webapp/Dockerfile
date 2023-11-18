# building app
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# serving app
FROM node:18-slim

WORKDIR /app
COPY --from=build /app/build /app/build

# intsalling server deps
COPY server .
RUN npm ci

CMD ["node", "app.js"]

