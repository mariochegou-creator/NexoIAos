# Nexo Treino — build multi-stage: client (Vite) → server (tsx)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm install --no-audit --no-fund
COPY shared/ shared/
COPY client/ client/
COPY server/ server/
RUN npm run build -w client

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY server/package.json server/
RUN npm install --no-audit --no-fund -w server --omit=dev
COPY shared/ shared/
COPY server/ server/
COPY --from=build /app/client/dist client/dist
EXPOSE 8787
CMD ["node", "node_modules/tsx/dist/cli.mjs", "server/src/index.ts"]
