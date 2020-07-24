# <center>GitTrends.app Crawler Service</center>

## Getting Started

```sh
ln -s ../../.env .env
ln -s ../../.tokens.txt .tokens.txt
```

## Usage

1. Start github proxy server

```sh
npx github-proxy-server --tokens tokens.txt
```

2. Add repositories to database

```sh
node add-repositories.js --limit <number> --language <language>
```

3. Schedule activities

```sh
# Available resources:
# repos, tags, releases, watchers, stargazers, issues, pulls, or users
node scheduler.js <resource|all>
```

4. Start collecting information

```sh
node update.js <resource> --workers <workers>
```

### PM2

Use pm2 to manage the update process:

```sh
npx pm2 start pm2-ecosystem.yml
```

<sub>\* Update pm2-ecosystem.yml file before starting</sub>

### Docker

You can also use docker containers:

```sh
# run containers
docker-compose up -d
# add/update repositories on dataset
docker-compose exec service node add-repositories.js --limit <number> --language <language>
docker-compose exec service node scheduler.js all
# to backup dataset
docker-compose exec -T mongo mongodump --archive --gzip --db "$(echo $GITTRENDS_MONGO_DB)" > ./dump-`date -u +%s000`.gz
```
