# ---------- Build ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ---------- Runtime ----------
FROM nginx:alpine

COPY --from=builder /app/dist /home/thackerayenoch/oj
