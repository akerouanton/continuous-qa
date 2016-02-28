BASE_REPO_NAME=continuousqa
CONTAINERS=phpqa php-cs-fixer
FIG=docker-compose --x-networking -p $(BASE_REPO_NAME)
CONTAINER=$(filter-out $@,$(MAKECMDGOALS))

ifneq (,$(CACHE))
	CACHE=--no-cache
endif

build:
	for CONTAINER in $(CONTAINERS); do echo "Building $$CONTAINER ..."; docker build -t $(BASE_REPO_NAME)/$$CONTAINER:latest docker/analyzers/$$CONTAINER; done
	$(FIG) build $(CACHE)

up:
	$(FIG) up --no-build -d

ps:
	$(FIG) ps

logs:
	$(FIG) logs $(CONTAINER)

introspect:
	docker exec -it $(BASE_REPO_NAME)_$(CONTAINER)_1 bash
