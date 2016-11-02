.PHONY: build build-analyzers up stop halt ps logs introspect rm run reload restart drop-databases load-fixtures
.PHONY: mongo-dump mongo-restore tests cleanup-runner cleanup install

COMPOSE_PROJECT_NAME?=continuousqa
export $COMPOSE_PROJECT_NAME
ENV=dev
FIG=docker-compose -p $(COMPOSE_PROJECT_NAME) -f docker/$(ENV).yml -f docker/debug.yml -f plugins/${ENV}.yml -f services/${ENV}.yml
ANALYZERS=$(shell ls analyzers/)
SERVICES=artifact-api build-api log-api pipeline-api

comma:= ,
empty:=
space:= $(empty) $(empty)

ANALYZER?=
ifneq (,$(A))
	ANALYZER=$(A)
endif
ANALYZER:= $(subst $(comma),$(space),$(ANALYZER))
ifneq (,$(ANALYZER))
	ANALYZERS=$(ANALYZER)
endif

CONTAINER?=
ifneq (,$(C))
	CONTAINER=$(C)
endif
CONTAINER:= $(subst $(comma),$(space),$(CONTAINER))

ifneq (,$(CACHE))
	override CACHE=--no-cache
endif

build-analyzers:
	for ANALYZER in $(ANALYZERS); do echo "Building $$ANALYZER ..."; docker build -t $(COMPOSE_PROJECT_NAME)/$$ANALYZER:latest analyzers/$$ANALYZER; done

build:
	$(FIG) build $(CACHE) $(CONTAINER)

up:
	$(FIG) up --no-build -d $(CONTAINER)

start: up

stop:
	$(FIG) stop $(CONTAINER)

halt: stop

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

restart: reload

ARTIFACT_API_DBNAME=$(shell awk -F= '/MONGO_DBNAME/ {print $$2}' services/artifact-api/.env)
BUILD_API_DBNAME=$(shell awk -F= '/MONGO_DBNAME/ {print $$2}' services/build-api/.env)
LOG_API_DBNAME=$(shell awk -F= '/MONGO_DBNAME/ {print $$2}' services/log-api/.env)
PIPELINE_API_DBNAME=$(shell awk -F= '/MONGO_DBNAME/ {print $$2}' services/pipeline-api/.env)
PLUGIN_API_DBNAME=$(shell awk -F= '/MONGO_DBNAME/ {print $$2}' services/plugin-api/.env)
drop-databases:
	$(FIG) exec -T mongodb mongo $(ARTIFACT_API_DBNAME) --eval "db.dropDatabase()"
	$(FIG) exec -T mongodb mongo $(BUILD_API_DBNAME) --eval "db.dropDatabase()"
	$(FIG) exec -T mongodb mongo $(LOG_API_DBNAME) --eval "db.dropDatabase()"
	$(FIG) exec -T mongodb mongo $(PIPELINE_API_DBNAME) --eval "db.dropDatabase()"
	$(FIG) exec -T mongodb mongo $(PLUGIN_API_DBNAME) --eval "db.dropDatabase()"

load-fixtures: drop-databases
	$(FIG) exec mongodb mongo $(BUILD_API_DBNAME) /fixtures/build-api/builds.js
	$(FIG) exec mongodb mongo $(LOG_API_DBNAME) /fixtures/log-api/logs.js
	$(FIG) exec mongodb mongo $(PIPELINE_API_DBNAME) /fixtures/pipeline-api/pipelines.js
	$(FIG) exec mongodb mongo $(PLUGIN_API_DBNAME) /fixtures/plugin-api/plugins.js

mongo-dump:
	$(FIG) exec mongodb mongodump --db=$(BUILD_API_DBNAME) --archive=/dumps/$(BUILD_API_DBNAME)
	$(FIG) exec mongodb mongodump --db=$(LOG_API_DBNAME) --archive=/dumps/$(LOG_API_DBNAME)
	$(FIG) exec mongodb mongodump --db=$(PIPELINE_API_DBNAME) --archive=/dumps/$(PIPELINE_API_DBNAME)
	$(FIG) exec mongodb mongodump --db=$(PLUGIN_API_DBNAME) --archive=/dumps/$(PLUGIN_API_DBNAME)

mongo-restore: drop-databases
	$(FIG) exec -T mongodb mongorestore --db=$(BUILD_API_DBNAME) --archive=/dumps/$(BUILD_API_DBNAME)
	$(FIG) exec -T mongodb mongorestore --db=$(LOG_API_DBNAME) --archive=/dumps/$(LOG_API_DBNAME)
	$(FIG) exec -T mongodb mongorestore --db=$(PIPELINE_API_DBNAME) --archive=/dumps/$(PIPELINE_API_DBNAME)
	$(FIG) exec -T mongodb mongorestore --db=$(PLUGIN_API_DBNAME) --archive=/dumps/$(PLUGIN_API_DBNAME)

tests:
	cd services/build-api && NODE_ENV=test npm run tests
	cd services/log-api && NODE_ENV=test npm run tests
	cd services/pipeline-api && NODE_ENV=test npm run tests
	cd services/runner-api && NODE_ENV=test npm run tests

ARTIFACTS_TMP_DIR=$(shell awk -F= '/TMP_DIR/ {print $$2}' services/runner-api/.env)
cleanup-runner:
	-docker ps -a -f "label=com.continuousqa.runner" | tail -n+2 | awk '{print $$1}' | xargs docker rm -vf 2>/dev/null
ifneq (,$(ARTIFACTS_TMP_DIR))
	-rm -rf $(ARTIFACTS_TMP_DIR)/*
endif

cleanup: rm cleanup-runner

install: build
	for file in services/**/.env.dist; do (test -f $${file%.dist} || cp $$file $${file%.dist}); done
	$(MAKE) up load-fixtures
