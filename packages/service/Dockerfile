FROM node:14-alpine

RUN apk add --update make gcc g++ python

WORKDIR /app
COPY . .
RUN rm -rf packages/website packages/website-api
RUN yarn install && yarn build && yarn install --force

WORKDIR /app/packages/service
EXPOSE 3000 8000-8010

CMD [ "./node_modules/.bin/pm2-runtime", "pm2-ecosystem.yml" ]
