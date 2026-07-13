# ---------- Build ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ---------- Runtime ----------
FROM alpine:latest

WORKDIR /frontend

COPY --from=builder /app/dist/ .
