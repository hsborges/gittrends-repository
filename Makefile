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

.PHONY: help \
				install env-config database-config service website website-api \
 				build build-docker

help:
		@echo "Makefile commands:"
		@echo "build"
		@echo "build-docker"

.DEFAULT_GOAL := build

install:
		@yarn workspace @gittrends/service install

env-config: install
		@echo "Building environment config"
		@yarn workspace @gittrends/env-config build

database-config: install env-config
		@echo "Building database config"
		@yarn workspace @gittrends/database-config build

service: install env-config database-config
		@echo "Building updater service"
		@yarn workspace @gittrends/service build

website: install env-config
		@echo "Building website"
		@yarn workspace @gittrends/website build

website-api: install env-config database-config
		@echo "Building website-api"
		@yarn workspace @gittrends/website-api build

build: install env-config database-config service website website-api


build-docker:
		@docker build --pull --compress -t ${SERVICE_IMAGE_NAME} -f packages/service/Dockerfile .
