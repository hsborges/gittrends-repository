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
		@yarn workspace @gittrends/env-config build
		@yarn workspace @gittrends/database-config build
		@yarn workspace @gittrends/service build
		@yarn workspace @gittrends/exporter build
		@yarn workspace @gittrends/website build
		@yarn workspace @gittrends/website-api build

build-docker:
		@docker build --pull --compress -t ${SERVICE_IMAGE_NAME} -f packages/service/Dockerfile .
