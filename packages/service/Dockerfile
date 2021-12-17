FROM node:lts-alpine

RUN apk add --update make gcc g++ python3 git bash

WORKDIR /app
COPY . .
RUN rm -rf packages
COPY ./packages/env-config ./packages/env-config
COPY ./packages/database ./packages/database
COPY ./packages/service ./packages/service

RUN yarn install
RUN yarn workspace @gittrends/env-config build
RUN yarn workspace @gittrends/database build
RUN yarn workspace @gittrends/service build

WORKDIR /app/packages/service

ENTRYPOINT [ "yarn", "pm2-runtime", "service.config.js" ]
