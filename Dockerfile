FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm\
     npm ci
COPY *.ts package* ./
COPY assets ./assets
RUN npm run build

FROM node:latest AS prune
WORKDIR /app
COPY --from=build /app ./
RUN npm prune --production

FROM gcr.io/distroless/nodejs26-debian13 AS runtime
WORKDIR /app
COPY .env /app/.env
COPY --from=prune /app/assets ./assets
COPY --from=prune /app/dist ./dist
COPY --from=prune /app/node_modules ./node_modules
COPY --from=prune /usr/lib/x86_64-linux-gnu/libuuid.so.1 /usr/lib/x86_64-linux-gnu/libuuid.so.1
CMD ["dist/index.cjs"]