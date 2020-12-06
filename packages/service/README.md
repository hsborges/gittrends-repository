# <center>GitTrends.app Crawler Service</center>

## Getting Started

## Usage

1. Start github proxy server

```sh
yarn proxy-server
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
npx pm2 start pm2-ecosystem.yml
npx pm2 logs
```

<sub>\* Update pm2-ecosystem.yml file before starting</sub>
