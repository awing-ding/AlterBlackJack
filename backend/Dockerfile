FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm\
     npm ci
COPY *.ts package* tsconfig.json ./
COPY routes/ ./routes/
COPY database/ ./database/
RUN npm run build

FROM node:latest AS prune
WORKDIR /app
COPY --from=build /app ./
RUN npm prune --production

FROM gcr.io/distroless/nodejs26-debian13 AS runtime
WORKDIR /app
COPY .env ./.env
COPY --from=prune /app/routes/ ./routes/
COPY --from=prune /app/dist/ ./dist/
COPY --from=prune /app/node_modules ./node_modules
CMD ["dist/index.cjs"]