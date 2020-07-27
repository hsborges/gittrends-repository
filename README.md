<!-- ABOUT THE PROJECT -->

# <center>GitTrends.app Service</center>

The goal of this project is to collect and analyze information from public GitHub projects using GitHub GraphQL API - Access [gittrends.app](https://gittrends.app) for more information.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- [NodeJS](https://nodejs.org)
- [Mongo](https://www.mongodb.com)
- [PostgreSQL](https://www.postgresql.org)
- [Redis](https://redis.io)
- [Docker](https://www.docker.com) (Optional)

### Installation

1. Clone the project

```sh
git clone https://github.com/hsborges/gittrends-repository.git
```

2. Install dependencies

```sh
yarn install
```

3. Create a file name `.env` and configure the environment variables

```sh
cp .env.example .env
```

4. Run database migrations

```sh
yarn workspace @gittrends/database-config run mongo:migrate
```

5. Create a text file (e.g., `tokens.txt`) and put your Github access tokens

## Packages

<!-- TODO -->

### Docker

You can also use docker containers:

```sh
# create a volume to store github data
docker volume create gittrends.app-database
docker volume create gittrends.app-website-database
# run containers
docker-compose up -d
# add/update repositories on dataset
docker-compose exec service node add-repositories.js --limit <number> --language <language>
docker-compose exec service node scheduler.js all
# to backup dataset
docker-compose exec -T mongo mongodump --archive --gzip --db "$(echo $GITTRENDS_MONGO_DB)" > ./dump-`date -u +%s000`.gz
```

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/hsborges/gittrends-repository/issues) for a list of proposed features (and known issues).

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

Project Link: [https://github.com/hsborges/gittrends-repository](https://github.com/hsborges/gittrends-repository)

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
