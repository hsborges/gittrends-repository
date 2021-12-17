#!make
.PHONY: help \
				install env database service website website-api \
 				build build-docker

help:
		@echo "Makefile commands:"
		@echo "build"
		@echo "build-docker"

.DEFAULT_GOAL := build

install:
		@yarn workspace @gittrends/service install

env: install
		@echo "Building environment config"
		@yarn workspace @gittrends/env build

database: install env
		@echo "Building database config"
		@yarn workspace @gittrends/database build

service: install env database
		@echo "Building updater service"
		@yarn workspace @gittrends/service build

website: install env
		@echo "Building website"
		@yarn workspace @gittrends/website build

website-api: install env database
		@echo "Building website-api"
		@yarn workspace @gittrends/website-api build

build: install env database service website website-api


build-docker:
		@docker build --pull --compress -t hsborges/service.gittrends.app -f packages/service/Dockerfile .
