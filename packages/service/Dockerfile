FROM node:14-alpine

RUN apk add --update make gcc g++ python

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
EXPOSE 3000 8000-8010

CMD [ "./node_modules/.bin/pm2-runtime", "pm2-ecosystem.yml" ]
