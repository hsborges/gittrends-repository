FROM node:14-alpine

ARG GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ARG GITHUB_REDIRECT_URI=${GITHUB_REDIRECT_URI}
ARG GT_WEBSITE_DATASOURCE_URL=${GT_WEBSITE_DATASOURCE_URL}

WORKDIR /app
COPY . .
RUN rm -rf packages

COPY ./packages/env-config ./packages/env-config
COPY ./packages/website ./packages/website

WORKDIR /app/packages/env-config
RUN yarn install && yarn build

WORKDIR /app/packages/website
RUN yarn install --force && yarn build

ENV PORT=80
EXPOSE 80

CMD [ "yarn", "start" ]
