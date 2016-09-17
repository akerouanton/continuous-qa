.PHONY: build up stop ps logs introspect rm artifact-api build-api docker front

COMPOSE_PROJECT_NAME?=continuousqa
export $COMPOSE_PROJECT_NAME
FIG=docker-compose -p $(COMPOSE_PROJECT_NAME) -f $(COMPOSE_FILE)
ANALYZERS=$(shell ls docker/analyzers/)
ENV=dev
COMPOSE_FILE=docker/$(ENV).yml

comma:= ,
empty:=
space:= $(empty) $(empty)

ANALYZER=
ifneq (,$(A))
	ANALYZER=$(A)
endif
ANALYZER:= $(subst $(comma),$(space),$(ANALYZER))
ifneq (,$(ANALYZER))
	ANALYZERS=$(ANALYZER)
endif

CONTAINER=
ifneq (,$(C))
	CONTAINER=$(C)
endif
CONTAINER:= $(subst $(comma),$(space),$(CONTAINER))

ifneq (,$(CACHE))
	override CACHE=--no-cache
endif

build-analyzers:
	for ANALYZER in $(ANALYZERS); do echo "Building $$ANALYZER ..."; docker build -t $(COMPOSE_PROJECT_NAME)/$$ANALYZER:latest docker/analyzers/$$ANALYZER; done

build:
	$(FIG) build $(CACHE) $(CONTAINER)

up:
	$(FIG) up --no-build -d $(CONTAINER)

stop:
	$(FIG) stop $(CONTAINER)

ps:
	$(FIG) ps $(CONTAINER)

logs:
	$(FIG) logs -f $(CONTAINER)

introspect:
	$(FIG) exec $(CONTAINER) /bin/bash

rm: stop
	$(FIG) rm -vf $(CONTAINER)

run:
	$(FIG) run --entrypoint /bin/bash $(CONTAINER)

reload: stop up

BUILD_API_DBNAME=$(shell awk -F= '/MONGO_DBNAME/ {print $$2}' build-api/.env)
drop-databases:
	$(FIG) exec mongodb mongo $(BUILD_API_DBNAME) --eval "db.dropDatabase()"

load-fixtures: drop-databases
	$(FIG) exec mongodb mongo $(BUILD_API_DBNAME) /fixtures/build-api/builds.js

mongo-dump:
	$(FIG) exec mongodb mongodump --db=$(BUILD_API_DBNAME) --archive=/dumps/$(BUILD_API_DBNAME)

mongo-restore: drop-databases
	$(FIG) exec mongodb mongorestore --db=$(BUILD_API_DBNAME) --archive=/dumps/$(BUILD_API_DBNAME)

tests-e2e:
	cd build-api && vendor/bin/behat
