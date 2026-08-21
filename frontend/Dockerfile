# ========= BUILD STAGE =========
FROM node:22.20.0-alpine3.21 AS builder

WORKDIR /app

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

# Copy package files trước để cache layer
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build


# ========= RUN STAGE =========
FROM node:22.20.0-alpine3.21 AS runner

WORKDIR /app

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL
ENV NODE_ENV=production

# Chỉ copy phần cần thiết
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]