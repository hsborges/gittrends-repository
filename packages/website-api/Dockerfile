FROM node:latest AS env-config

WORKDIR /app/env-config
COPY /packages/env-config/package.json .
RUN yarn install
COPY /packages/env-config/. .

FROM node:latest AS database-config

WORKDIR /app
COPY --from=env-config /app/env-config env-config
WORKDIR /app/database-config
COPY /packages/database-config/package.json .
RUN yarn install
COPY /packages/database-config/. .


FROM node:alpine

WORKDIR /app
COPY --from=env-config /app/env-config env-config
COPY --from=database-config /app/database-config database-config

WORKDIR /app/website-api
COPY /packages/website-api/package.json .
RUN yarn install
COPY /packages/website-api/. .

EXPOSE 80

CMD [ "yarn", "start", "--port",  "80" ]
