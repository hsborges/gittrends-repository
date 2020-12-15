[![](https://images.microbadger.com/badges/image/hsborges/docker-autossh-tunnel.svg)](https://microbadger.com/images/hsborges/docker-autossh-tunnel)

# Docker AUTO-SSH Tunnel

This Docker creates a simple SSH tunnel over a server. It is very useful when your container needs to access to an external protected resource. In this case this container might behave like a proxy to outer space inside your Docker network.

## Usage

1. First you should create a config file in your local directory. For simplicity you can create this file in `~/.ssh` in your local machine.

2. Inside `~/.ssh/config` put these lines:

```
Host mysql-tunnel # You can use any name
    HostName ssh-tunnel.corporate.tld # Tunnel
    IdentityFile ~/.ssh/id_rsa # Private key location
    User cagatay.guertuerk # Username to connect to SSH service
    ForwardAgent yes
    TCPKeepAlive yes
    ConnectTimeout 5
    ServerAliveCountMax 10
    ServerAliveInterval 15
```

3. Don't forget to put your private key (`id_rsa`) to `~/.ssh` folder.

4. Now in `docker-compose.yml` you can define the tunnel as follows:

```
version: '3'
services:
  postgres:
    image: hsborges/docker-autossh-tunnel:0.0.2
    volumes:
      - $HOME/.ssh:/root/ssh:ro
    environment:
      TUNNEL_HOST: postgres-tunnel
      REMOTE_HOST: tunneled-sql.corporate.internal.tld
      LOCAL_PORT: 5432
      REMOTE_PORT: 5432
```

5. Run `docker-compose up -d`

After you start up docker containers, any container in the same network will be able to access to tunneled postgres instance using `tcp://postgres:5432`. Of course you can also expose port 5432 to be able to access to tunneled resource from your host machine.
