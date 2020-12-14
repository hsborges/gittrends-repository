# Configuring environment

First of all, we need to install common libs which may help in several tasks. The following commands are recommended.

```bash
# git and curl are mandatory
sudo apt install -y git curl tmux
# the postgres client is recommended to backup and restore data
sudo apt install -y postgresql-client
```

You may want to enhance the system terminal with `zsh` and some useful plugin.

```bash
# install rerequisites
sudo apt install -y zsh

# install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# check if it was correctly installed
zsh

# install and configure spaceship as default theme
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt"
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
echo "ZSH_THEME=\"spaceship\"" >> ~/.zshrc

# install a plugin manager for zsh
yes y | sh -c "$(curl -fsSL https://raw.githubusercontent.com/zdharma/zinit/master/doc/install.sh)"

# add some useful plugins to zsh
echo "zinit light zdharma/fast-syntax-highlighting" >>  ~/.zshrc
echo "zinit light zsh-users/zsh-autosuggestions" >>  ~/.zshrc
echo "zinit light zsh-users/zsh-completions" >>  ~/.zshrc
echo "zinit light zsh-users/zsh-docker" >>  ~/.zshrc

# enable zsh at bash login
echo "exec /bin/zsh --login" >> ~/.bash_login
```

If you need to run the scripts on the machine, you must install `node` and `yarn`.

```bash
# install requirements
sudo apt install curl gcc g++ make

# install nodejs
curl -sL https://deb.nodesource.com/setup_15.x | sudo bash -
sudo apt install -y nodejs

# install yarn
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
sudo echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install -y yarn
```

Finally, install `docker` and `docker-compose`.

```bash
# install  docker
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
# curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add - # (on Debian)
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
# sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" # (on Debian)
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# add docker to system startup
sudo systemctl enable docker
sudo systemctl restart docker

# add current user to docker group
sudo usermod -aG docker $USER

# install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# restart system is required to work properly
```
