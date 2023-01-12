# Dependencies
FROM node:18-bullseye-slim AS deps
ARG PORT
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json /app/
RUN npm install --omit=dev

# Build
FROM node:18-bullseye-slim AS build
ARG PORT
WORKDIR /app
COPY package*.json tsconfig.json /app/
COPY ./src /app/src
RUN \
    npm install && \
    npm run build

# Release
FROM node:18-bullseye-slim AS release
ARG PORT=8080
ENV PORT=${PORT}
EXPOSE ${PORT}
WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
ENV NODE_ENV=production
COPY --from=deps --chown=node:node /app/ /home/node/app/
COPY --from=build --chown=node:node /app/dist/ /home/node/app/
CMD ["node", "/home/node/app/server.js"]
