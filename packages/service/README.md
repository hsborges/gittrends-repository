# <center>GitTrends.app Crawler Service</center>

## Getting Started

## Usage

1. Start github proxy server

```sh
yarn github-proxy-server
```

2. Add repositories to database

```sh
yarn add-repositories --limit <number> --language <language>
```

3. Schedule activities

```sh
# Available resources:
# repos, tags, releases, watchers, stargazers, issues, pulls, or users
yarn schedule <resource|all>
```

4. Start collecting information

```sh
yarn update <resource> --workers <workers>
```

### PM2

Use pm2 to manage the update process:

```sh
yarn pm2
```

<sub>\* Update pm2-ecosystem.yml file before starting</sub>

### Docker

You can also use docker containers:

```sh
# run containers
docker-compose up -d
# add/update repositories on dataset
docker-compose exec service yarn add-repositories --limit <number> --language <language>
docker-compose exec service yarn schedule all
# to backup dataset
docker-compose exec -T mongo mongodump --archive --gzip --db "$(echo $GITTRENDS_MONGO_DB)" > ./dump-`date -u +%s000`.gz
```
