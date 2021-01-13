FROM node:alpine

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

CMD [ "yarn", "repos-stats" ]
