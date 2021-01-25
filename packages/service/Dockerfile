FROM node:alpine

RUN apk add --update python2

WORKDIR /app
COPY . .
RUN rm -rf packages/website packages/website-api packages/docker-autossh-tunnel
RUN yarn install

WORKDIR /app/packages/env-config
RUN yarn build

WORKDIR /app/packages/database-config
RUN yarn build

WORKDIR /app/packages/service
RUN yarn install --force && yarn build

EXPOSE 3000
EXPOSE 8000-8010

CMD [ "./node_modules/.bin/pm2-runtime", "pm2-ecosystem.yml" ]
