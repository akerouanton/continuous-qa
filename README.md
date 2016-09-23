# Continuous QA

Multi-tenant CI platform wirtten in NodeJS. Version 0.1 focus on API endpoints.

**Requirements:**
  * Docker: >= 1.12
  * Docker Compose: >= 1.8

**Useful links:**
  * [API Documentation](http://localhost/docs/)
  * [Mongoclient](http://localhost:3000/)
  * [RabbitMQ UI](http://localhost:15672/)

**Make targets**:
  * **install**: Build containers and create .env files from their .dist counterpart
  * **load-fixtures**: Load a set of fixtures data
  * **build*: Build containers
  * **build-analyzers*: Build analyzers used by the Runner API
  * **start**/**up**: Start containers
  * **restart**/**reload**: Restart containers
  * **stop**/**halt**: Stop containers
  * **rm**: Delete containers and volumes
  * **cleanup**: Delete containers & volumes for the stack & runners
  * **cleanup⁻runner**: Delete containers and volumes used by runners
  * **mongo-dump**: Dump databases in `/dumps`
  * **mongo-restore**: Restore databases dumped in `/dumps`
  * **tests-e2e**: Execute end-to-end tests

Directory structure:
  * **analyzers/**: You'll find analyzers with their respective Dockerfile and entrypoint here
  * **docker/**: Contains shared containers (like mongodb or nginx) and `docker-compose` configuration
  * **dumps/**: Store dumps used for running end-to-end tests
  * **services/**: Contains microservices composing the application

## How to install

```bash
git clone https://github.com/NiR-/continuous-qa
cd continuous-qa
make install up # Wait a bit after the up
make load-fixtures
```

Now, you can browse to `http://localhost/docs/` and start it.

## TODO

  * Add stats
  * Add tests _everywhere_
  * Add gateway
  * Add front UI
  * Add support for gitlab
