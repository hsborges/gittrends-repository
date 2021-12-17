#!/bin/sh
# update system
apt-get update -y && apt-get dist-upgrade -y

# install system dependencies
apt-get install git curl build-essential -y

# install docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh && rm get-docker.sh

# install docker-compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# install nodejs & yarn
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs
npm install --global --force yarn

## Extras
# install mongo tools
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt-get update && apt-get install -y mongodb-org-tools
