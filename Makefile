#!make
# INCLUDE ENVIRONMENT VARIABLES FROM FILE
include .env
export $(shell sed 's/=.*//' .env)

# DOCKER VARIABLES
env-file=.env
detach=false
command=

# VARIABLES
BASE_DIR=$(shell pwd)
SERVICE_IMAGE_NAME=hsborges/service.gittrends.app
REPO=https://github.com/hsborges/gittrends-repository

.PHONY: help build build push up dev service

help:
		@echo "Makefile commands:"
		@echo "build"
		@echo "push"
		@echo "pull"
		@echo "up"
		@echo "dev"
		@echo "service"

.DEFAULT_GOAL := build

build:
		@docker build --pull --compress -t ${SERVICE_IMAGE_NAME} -f packages/service/Dockerfile .

push:
		@docker push ${SERVICE_IMAGE_NAME}

pull:
		@docker pull ${SERVICE_IMAGE_NAME}

service:
		@docker run -it --rm --env-file=${env-file} --network host --detach=${detach} \
			-v ${BASE_DIR}/data/tokens.txt:/app/data/tokens.txt:ro \
			-v ${BASE_DIR}/packages/service/pm2-ecosystem.yml:/app/packages/service/pm2-ecosystem.yml:ro \
			${SERVICE_IMAGE_NAME}:latest ${command}
