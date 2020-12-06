#!/bin/sh
docker build --tag gittrends-service:latest -f packages/service/Dockerfile .
docker build --tag gittrends-website-api:latest -f packages/website-api/Dockerfile .
docker build --tag gittrends-website:latest -f packages/website/Dockerfile .

