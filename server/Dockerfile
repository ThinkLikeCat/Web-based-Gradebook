FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build
RUN cp -r src/infrastructure/database/postgres/migrations dist/infrastructure/database/postgres/migrations

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
