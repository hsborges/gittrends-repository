FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g pm2
COPY . .
VOLUME /usr/src/app/config
CMD pm2 start pm2-ecosystem.yml && pm2 logs --lines 1
