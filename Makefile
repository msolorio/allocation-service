# # these will speed up builds, for docker-compose >= 1.25
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1

build:
	docker-compose build

up:
	docker-compose up -d app
	docker-compose exec -d app npm run build:watch

down:
	docker-compose down

down-remove-volumes:
	docker-compose down -v

logs:
	docker-compose logs app | tail -100

ts-build:
	docker-compose run --rm --no-deps --entrypoint='npm run build' app

test:
	docker-compose exec app npm test

test-coverage:
	docker-compose exec app npm run test:coverage

migrate:
	docker-compose run --rm --no-deps --entrypoint='npm run prisma:migrate' app

# make run cmd='<command>'
run:
	docker-compose run --rm --no-deps --entrypoint='$(cmd)' app

build-ci:
	docker-compose -f docker-compose.ci.yml build

up-ci:
	docker-compose -f docker-compose.ci.yml up -d app

migrate-ci:
	docker-compose run --rm --no-deps --entrypoint='npm run prisma:migrate' app

test-ci:
	docker-compose -f docker-compose.ci.yml run --rm --no-deps --entrypoint='npm test' app