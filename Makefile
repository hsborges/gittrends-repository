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
		@echo "build-docker"

.DEFAULT_GOAL := build

build:
		@echo "Preparing packages to build"
		@echo "Building environment config"
		@yarn workspace @gittrends/env-config install
		@yarn workspace @gittrends/env-config build
		@echo "Building database config"
		@yarn workspace @gittrends/database-config install
		@yarn workspace @gittrends/database-config build
		@echo "Building updater service"
		@yarn workspace @gittrends/service install --force
		@yarn workspace @gittrends/service build
		@echo "Building website"
		@yarn workspace @gittrends/website install
		@yarn workspace @gittrends/website build
		@echo "Building website-api"
		@yarn workspace @gittrends/website-api install
		@yarn workspace @gittrends/website-api build

build-docker:
		@docker build --pull --compress -t ${SERVICE_IMAGE_NAME} -f packages/service/Dockerfile .
