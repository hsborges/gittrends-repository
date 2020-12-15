FROM node:alpine as env-config

WORKDIR /app/env-config
COPY /packages/env-config/package.json .
RUN yarn install
COPY /packages/env-config/. .

FROM node:alpine

WORKDIR /app
COPY --from=env-config /app/env-config env-config

ARG GITHUB_CLIENT_ID

WORKDIR /app/website
COPY /packages/website/package.json .
RUN yarn install
COPY /packages/website/. .
RUN yarn generate

EXPOSE 80

CMD [ "yarn", "start", "--port", "80", "-H", "0.0.0.0" ]
