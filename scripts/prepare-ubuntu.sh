#!/bin/sh

# install dependencies
apt update && apt dist-upgrade -y
apt install -y curl tmux postgresql-client

# install and configure docker
apt install -y docker docker-compose
usermod -aG docker $USER
newgrp docker

# create gittrends network and volume on docker
docker network create gittrends
docker volume create --name=gittrends.app

# install nodejs and yarn
curl -sL https://deb.nodesource.com/setup_15.x | -E bash -
apt install -y nodejs

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt update && apt install -y yarn
