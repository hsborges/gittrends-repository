include .env

.PHONY: up
up: install
	docker-compose up -d

.PHONY: down
down:
	docker-compose down

.PHONY: logs
logs:
	docker-compose logs -f gittrends

install:
	yarn install	