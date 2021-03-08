FROM node:alpine

LABEL maintainer = "Hudson Silva Borges <hudsonsilbor[at]gmail.com>"
LABEL website    = "www.gittrends.app"

RUN apk add --update make gcc g++ python bash curl openssl nginx certbot monit
RUN npm install -g pm2
RUN curl https://get.acme.sh | sh

RUN mkdir -p /etc/monit/conf.d && touch /etc/monit/conf.d/nginx.conf
RUN echo "check process nginx with pidfile /var/run/nginx.pid" >> /etc/monit/conf.d/nginx.conf
RUN echo "start program = \"nginx\"" >> /etc/monit/conf.d/nginx.conf
RUN echo "stop program = \"nginx -s stop\"" >> /etc/monit/conf.d/nginx.conf

WORKDIR /app
ARG GITHUB_CLIENT_ID
COPY . .
RUN rm -rf /app/packages/service
RUN yarn install && yarn build && yarn install --force
RUN cd /etc/nginx/conf.d && ln -s /app/data/nginx/default.conf gittrends.conf
RUN mkdir /run/nginx

EXPOSE 80

VOLUME [ "/app/data/certbot", "/app/data/nginx" ]

CMD nginx && pm2-runtime /app/data/pm2-website.yml
