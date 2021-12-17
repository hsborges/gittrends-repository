FROM node:14-alpine


WORKDIR /app
COPY . .
RUN rm -rf packages

COPY ./packages/env ./packages/env
COPY ./packages/website-api ./packages/website-api

WORKDIR /app/packages/env
RUN yarn install && yarn build

WORKDIR /app/packages/website-api
RUN yarn install --force && yarn build

ENV PORT=80
EXPOSE 80

CMD [ "yarn", "start" ]
