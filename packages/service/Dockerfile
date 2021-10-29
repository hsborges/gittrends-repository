FROM node:alpine

RUN apk add --update make gcc g++ python3

WORKDIR /app
COPY . .
RUN rm -rf packages

COPY ./packages/env-config ./packages/env-config
COPY ./packages/database-config ./packages/database-config
COPY ./packages/service ./packages/service

WORKDIR /app/packages/env-config
RUN yarn install && yarn build

WORKDIR /app/packages/database-config
RUN yarn install && yarn build

WORKDIR /app/packages/service
RUN yarn install && yarn build

WORKDIR /app/packages/service
