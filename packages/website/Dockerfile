FROM node:latest as env-config

WORKDIR /app/env-config
COPY /packages/env-config/package.json .
RUN yarn install
COPY /packages/env-config/. .

FROM node:latest

WORKDIR /app
COPY --from=env-config /app/env-config env-config

ARG GITHUB_CLIENT_ID
ENV GITTRENDS_API_HOST=${GITTRENDS_API_HOST}
ENV GITTRENDS_API_PORT=${GITTRENDS_API_PORT}

WORKDIR /app/website
COPY /packages/website/package.json .
RUN yarn install
COPY /packages/website/. .
RUN yarn build

EXPOSE 80

CMD [ "yarn", "start", "--port", "80", "-H", "0.0.0.0" ]
