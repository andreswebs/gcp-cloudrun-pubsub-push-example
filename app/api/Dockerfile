# Dependencies
FROM node:16-buster-slim AS deps
ARG PORT
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json /app/
RUN \
  npm ci --omit=dev

# Build
FROM node:16-buster-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json /app/
COPY ./src /app/src
RUN \
  npm install && \
  npm run build

# Release
FROM node:16-buster-slim
ARG PORT=8080
ENV PORT=$PORT
EXPOSE $PORT
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/ /app/
COPY --from=build /app/dist/ /app/
CMD ["node", "/app/app.js"]
