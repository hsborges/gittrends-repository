# <center>GitTrends.app Crawler Service</center>

## Getting Started

This package is responsible for collecting the github data and store on database.

## Usage

1. Compile the source code

```sh
yarn build
```

2. Start github proxy server

```sh
yarn proxy-server
```

3. Add repositories to database

```sh
yarn add-repositories --limit <number> --language <language>
```

4. Schedule activities

```sh
# Available resources:
# repository, tags, releases, watchers, stargazers, issues, pull_requests, or users
yarn schedule <resource|all>
```

5. Start collecting information

```sh
yarn update --type <repositories|users> --workers <workers>
```
