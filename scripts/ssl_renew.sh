#!/bin/bash

COMPOSE="docker-compose --no-ansi"
DOCKER="docker"

$COMPOSE run certbot renew --dry-run && $COMPOSE kill -s SIGHUP website
$DOCKER system prune -af
