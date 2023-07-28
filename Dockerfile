# followed this guide, adapted to sveltekit
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
FROM node:18.17.0-bookworm-slim as build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
ENV ALEXANDRITE_RUN_IN_NODE=true

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci
ENV NODE_ENV production
COPY . /usr/src/app
RUN npm run build

FROM node:18.17.0-bookworm-slim
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production
COPY --chown=node:node --from=build /usr/src/app/build /usr/src/app/build

CMD ["dumb-init", "node", "build"]


