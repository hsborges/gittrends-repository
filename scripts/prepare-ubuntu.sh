#!/bin/sh
# install dependencies
apt update && apt dist-upgrade -y
apt install -y curl tmux postgresql-client

# install zsh and some useful plugins
apt install -y zsh
zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt"
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
yes y | sh -c "$(curl -fsSL https://raw.githubusercontent.com/zdharma/zinit/master/doc/install.sh)"
echo "ZSH_THEME=\"spaceship\"" >> ~/.zshrc
echo "zinit light zdharma/fast-syntax-highlighting" >>  ~/.zshrc
echo "zinit light zsh-users/zsh-autosuggestions" >>  ~/.zshrc
echo "zinit light zsh-users/zsh-completions" >>  ~/.zshrc
echo "exec /bin/zsh --login" >> ~/.bash_login

# install nodejs and yarn
curl -sL https://deb.nodesource.com/setup_15.x | bash -
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
docker network create gittrends.app
docker volume create --name=gittrends.app
