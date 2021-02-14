# DOCKER VARIABLES
env-file=.env

# VARIABLES
BASE_DIR=$(shell pwd)
IMAGE_NAME=gittrends.app
IMAGE_FULLNAME=hsborges/gittrends.app
REPO=https://github.com/hsborges/gittrends-repository

.PHONY: help build push up dev

help:
		@echo "Makefile commands:"
		@echo "build"
		@echo "push"
		@echo "pull"
		@echo "up"
		@echo "dev"

.DEFAULT_GOAL := build

build:
		@docker build --pull --compress -t ${IMAGE_FULLNAME} .

push:
		@docker push ${IMAGE_FULLNAME}

pull:
		@docker pull ${IMAGE_FULLNAME}

up:
		@docker run -i --rm --env-file=${env-file} -p 80:80 -p 443:443 \
			-v ${BASE_DIR}/data/certbot:/app/data/certbot:ro \
			-v gittrends-nginx-cache:/var/cache \
			hsborges/gittrends.app:latest

dev:
		@docker run -i --rm --env-file=${env-file} -p 80:80 \
			-v ${BASE_DIR}/data/nginx/development.conf:/app/data/nginx/default.conf:ro \
			-v gittrends-nginx-cache:/var/cache \
			hsborges/gittrends.app:latest
