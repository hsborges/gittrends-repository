# DOCKER VARIABLES
env-file=.env
detach=false

# VARIABLES
BASE_DIR=$(shell pwd)
WEBSITE_IMAGE_NAME=hsborges/gittrends.app
SERVICE_IMAGE_NAME=hsborges/service.gittrends.app
REPO=https://github.com/hsborges/gittrends-repository

.PHONY: help build build-website build-service push up dev service

help:
		@echo "Makefile commands:"
		@echo "build"
		@echo "push"
		@echo "pull"
		@echo "up"
		@echo "dev"
		@echo "service"

.DEFAULT_GOAL := build

build: build-website build-service

build-website:
		@docker build --pull --compress -t ${WEBSITE_IMAGE_NAME} .

build-service:
		@docker build --pull --compress -t ${SERVICE_IMAGE_NAME} -f packages/service/Dockerfile .

push:
		@docker push ${WEBSITE_IMAGE_NAME}
		@docker push ${SERVICE_IMAGE_NAME}

pull:
		@docker pull ${WEBSITE_IMAGE_NAME}
		@docker pull ${SERVICE_IMAGE_NAME}

up:
		@docker run -it --rm --env-file=${env-file} -p 80:80 -p 443:443 --detach=${detach} \
			-v ${BASE_DIR}/data/certbot:/app/data/certbot:ro \
			-v gittrends-nginx-cache:/var/cache \
			${WEBSITE_IMAGE_NAME}:latest

dev:
		@docker run -it --rm --env-file=${env-file} -p 80:80 --detach=${detach} \
			-v ${BASE_DIR}/data/nginx/development.conf:/app/data/nginx/default.conf:ro \
			-v gittrends-nginx-cache:/var/cache \
			${WEBSITE_IMAGE_NAME}:latest

service:
		@docker run -it --rm --env-file=${env-file} --network host --detach=${detach} \
			-v ${BASE_DIR}/data/tokens.txt:/app/data/tokens.txt:ro \
			-v ${BASE_DIR}/packages/service/pm2-ecosystem.yml:/app/packages/service/pm2-ecosystem.yml:ro \
			${SERVICE_IMAGE_NAME}:latest
