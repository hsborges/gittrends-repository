FROM node:alpine

RUN apk add --update make gcc g++ python3 git

WORKDIR /app
COPY . .
RUN rm -rf packages

WORKDIR /app/packages/env-config
COPY ./packages/env-config .
RUN yarn install && yarn build

WORKDIR /app/packages/database-config
COPY ./packages/database-config .
RUN yarn install && yarn build

WORKDIR /app/packages/service
COPY ./packages/service .
RUN yarn install --force && yarn build
