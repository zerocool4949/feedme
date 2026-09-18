FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
RUN pnpm install --filter backend... --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./backend
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
RUN pnpm install --filter backend... --frozen-lockfile --prod
COPY backend/prisma ./backend/prisma
COPY --from=build /app/backend/dist ./backend/dist
WORKDIR /app/backend
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
