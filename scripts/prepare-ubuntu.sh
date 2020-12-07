#!/bin/sh
# install dependencies
apt update && apt dist-upgrade -y
apt install -y curl tmux postgresql-client

# install nodejs and yarn
curl -sL https://deb.nodesource.com/setup_15.x | -E bash -
apt install -y nodejs

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt update && apt install -y yarn

# install and configure docker
apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io
usermod -aG docker $USER
systemctl enable docker
systemctl start docker

curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# create gittrends network and volume on docker
docker network create gittrends-app
docker volume create --name=gittrends.app
