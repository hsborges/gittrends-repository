sudo apt update && sudo apt dist-upgrade -y
sudo apt install -y curl tmux docker docker-compose postgresql-client
sudo usermod -aG docker $USER
newgrp docker

docker network create gittrends
docker volume create --name=gittrends.app

curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt install -y nodejs

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install -y yarn
