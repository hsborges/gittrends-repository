<!-- ABOUT THE PROJECT -->

# <center>GitTrends.app Service</center>

This project collects information from public GitHub projects using GitHub GraphQL API - Access [gittrends.app](https://gittrends.app) for more information.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- [NodeJS](https://nodejs.org)
- [Mongo](https://www.mongodb.com)
- [Redis](https://redis.io)
- [Docker](https://www.docker.com) (Optional)

### Installation

1. Clone the project

```sh
git clone https:://github.com/hsborges/gittrends-service.git
```

2. Install dependencies

```sh
yarn install
```

3. Create a file name `.env` and set the environment variables

```sh
# redis - caching and messaging queue
GITTRENDS_REDIS_HOST=localhost
GITTRENDS_REDIS_PORT=6379
GITTRENDS_REDIS_DB=0

# mongodb - github data storage
GITTRENDS_MONGO_HOST=localhost
GITTRENDS_MONGO_PORT=27017
GITTRENDS_MONGO_DB=gittrends_app-development

# github proxy configuration
GITTRENDS_PROXY_PROTOCOL=http
GITTRENDS_PROXY_HOST=localhost
GITTRENDS_PROXY_PORT=3000
GITTRENDS_PROXY_TIMEOUT=20000
GITTRENDS_PROXY_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:71.0) Gecko/20100101 Firefox/71.0"
GITTRENDS_PROXY_RETRIES=5

# other
GITTRENDS_QUEUE_ATTEMPS=3
GITTRENDS_BATCH_SIZE=1000
GITHUB_TOKENS_FILE=tokens.txt
```

4. Run database migrations

```sh
npx migrate up --env .env
```

5. Create a text file (e.g., `tokens.txt`) and put your Github access tokens

<!-- USAGE EXAMPLES -->

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

Use pm2 to manage the process:

```sh
npx pm2 start pm2-ecosystem.yml
```

<sub>\* Update pm2-ecosystem.yml file before starting</sub>

### Docker

You can also use docker containers:

```sh
# create a volume to store github data
docker volume create gittrends.app-database
# run containers
docker-compose up -d gittrends-service
# add/update repositories on dataset
docker-compose exec gittrends-service node add-repositories.js --limit <number> --language <language>
docker-compose exec gittrends-service node scheduler.js all
```

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/hsborges/gittrends-service/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Hudson Silva Borges - [@hudsonsilbor](https://twitter.com/hudsonsilbor) - `hsborges[at]facom.ufms.br`

Project Link: [https://github.com/hsborges/gittrends-service](https://github.com/hsborges/gittrends-service)

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [Marco Tulio Valente](https://github.com/mtov)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
<!-- [contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=flat-square -->
<!-- [contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors -->
<!-- [forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=flat-square -->
<!-- [forks-url]: https://github.com/othneildrew/Best-README-Template/network/members -->
<!-- [stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=flat-square -->
<!-- [stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers -->
<!-- [issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=flat-square -->
<!-- [issues-url]: https://github.com/othneildrew/Best-README-Template/issues -->
<!-- [license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=flat-square -->
<!-- [license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt -->
<!-- [linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555 -->
<!-- [linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png -->
