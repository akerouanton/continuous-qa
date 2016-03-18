BASE_REPO_NAME=continuousqa
CONTAINERS=phpqa php-cs-fixer
ENV=dev
COMPOSE_FILE=docker/dev.yml

ifneq (dev,$(ENV))
	COMPOSE_FILE=docker/common.yml
endif

FIG=docker-compose --x-networking -p $(BASE_REPO_NAME) -f $(COMPOSE_FILE)

CONTAINER=
ifneq (,$(C))
	CONTAINER=$(C)
endif

ifneq (,$(CACHE))
	CACHE=--no-cache
endif

.PHONY: build up stop ps logs introspect rm artifact-api build-api docker front

build:
ifeq (,$(CONTAINER))
	for CONTAINER in $(CONTAINERS); do echo "Building $$CONTAINER ..."; docker build -t $(BASE_REPO_NAME)/$$CONTAINER:latest docker/analyzers/$$CONTAINER; done
endif
	$(FIG) build $(CACHE) $(CONTAINER)

up:
	$(FIG) up --no-build -d $(CONTAINER)

stop:
	$(FIG) stop $(CONTAINER)

ps:
	$(FIG) ps

logs:
	$(FIG) logs $(CONTAINER)

introspect:
	docker exec -it $(BASE_REPO_NAME)_$(CONTAINER)_1 bash

rm: stop
	$(FIG) rm -vf $(CONTAINER)

run:
	$(FIG) run --entrypoint /bin/bash $(CONTAINER)

reload: stop up
