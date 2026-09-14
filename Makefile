.PHONY: up down restart build logs migrate db-upgrade

up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

migrate:
	docker compose exec -T backend sh -c "cd /project/backend && alembic upgrade head"

db-upgrade: migrate
