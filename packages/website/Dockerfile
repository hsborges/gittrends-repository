FROM node:latest as env-config

WORKDIR /app/env-config
COPY /packages/env-config/package.json .
RUN yarn install
COPY /packages/env-config/. .

FROM node:latest

WORKDIR /app
COPY --from=env-config /app/env-config env-config

ARG GITTRENDS_API_HOST=localhost
ARG GITTRENDS_API_PORT=3000

WORKDIR /app/website
COPY /packages/website/package.json .
RUN yarn install
COPY /packages/website/. .
RUN yarn build

EXPOSE 80

CMD [ "yarn", "start", "--port", "80", "-H", "0.0.0.0" ]
