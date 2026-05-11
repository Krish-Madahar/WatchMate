FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
RUN npx tsc

FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Run db push and start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]