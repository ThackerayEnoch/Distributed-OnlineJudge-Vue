# ---------- Build ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# 调试：看看 dist 是否生成
RUN ls -R /app/dist


# ---------- Runtime ----------
FROM alpine:3.22

WORKDIR /frontend

COPY --from=builder /app/dist/. .

# 调试：看看镜像最终内容
RUN ls -R /frontend

CMD ["sh"]
