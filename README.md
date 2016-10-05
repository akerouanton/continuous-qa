# Continuous QA

Multi-tenant CI platform based on Docker, supporting pipelines and written in Javascript & PHP (using AMQP & ZMQ).

Version 0.1 focus on API endpoints. For now best front-end is the apidoc (auto-generated/auto-updated as soon as you 
start the stack).

**Requirements:**
  * Docker: >= 1.12
  * Docker Compose: >= 1.8

**Useful links:**
  * [API Documentation](http://localhost/docs/)
  * [RabbitMQ UI](http://localhost:15672/)

**Make targets**:
  * **install**: Build containers and create .env files from their .dist counterparts
  * **load-fixtures**: Load a set of data fixtures
  * **build**: Build containers
  * **build-analyzers**: Build analyzers used by the Runner API
  * **start**/**up**: Start containers
  * **restart**/**reload**: Restart containers
  * **stop**/**halt**: Stop containers
  * **rm**: Delete containers and volumes
  * **cleanup**: Delete containers & volumes for the stack & runners
  * **cleanup⁻runner**: Delete containers and volumes used by runners
  * **mongo-dump**: Dump databases in `/dumps`
  * **mongo-restore**: Restore databases dumped in `/dumps`
  * **tests**: Execute end-to-end tests

Directory structure:
  * **analyzers/**: You'll find analyzers with their respective Dockerfile and entrypoint here
  * **docker/**: Contains shared services (like mongodb or nginx) and `docker-compose` configuration
  * **dumps/**: Store dumps used for running integration/end-to-end tests
  * **services/**: Contains microservices composing the application

## How to install

```bash
git clone https://github.com/NiR-/continuous-qa
cd continuous-qa
make install up # Wait a bit after the up & before the load-fixtures
make load-fixtures
```

Now, you can browse to `http://localhost/docs/` and start it.

## How to run tests

You need to create database dumps before executing test suites: `make load-fixtures mongo-dump`.

Then you can run all test suites using `make tests`.

## TODO
  
  * Replace hardcoded container hostnames by network aliases
  * Add gateway
  * Make http services truly RESTful
  * Add infra logs (`docker logs`/`make logs` sucks)
  * Add tests (it's a POC, don't care for now)
  * Add stats (for fun)
  * Add front UI
  * Add support for rkt
  * Add support for gitlab/bitbucket
  * For `gh-hooks`, switch to node 3.6 when available (see `@TODO` in `SignatureChecker`)
