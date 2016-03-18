# Continuous QA

Useful links:
  * [RabbitMQ UI](http://localhost:15672/)

## Services

### Analyzer *(in js)*

No endpoint, but it consumes `run_analysis` queue. Messages should have this form:
```json
{
  "project_name": "Gaufrette",
  "project_url": "https://github.com/KnpLabs/Gaufrette",
  "build_id": "789",
  "analyzer": "php-cs-fixer"
}
```

### Artifact API *(in ruby)*

| Method | Endpoint                  |                                                                |
|--------|---------------------------|----------------------------------------------------------------|
| GET    | /artifacts/:urn           | `:urn` should be any urn, but it is expected to be a build urn |
| GET    | /artifacts/:urn/:filename |                                                                |
| PUT    | /artifacts/:urn/:filename | File upload should be the request body                         |

### Build API *(in php)*

| Method | Endpoint         |                                                              |
|--------|------------------|--------------------------------------------------------------|
| GET    | /builds/:urn     | `urn` should be any urn, but is expected to be a project urn |
| GET    | /builds/:urn/:id |                                                              |
| POST   | /builds/:urn/new |                                                              |

### Front

Currently it's only a flat html file.

### User API

| Method | Endpoint        |                                                               |
|--------|-----------------|---------------------------------------------------------------|
| GET    | /connect/github | Sign in/sign up with a github account, redirect to /connected |
| GET    | /profile        |                                                               |

## TODO

  * Add statsd
  * Add tests _everywhere_
  * Add elixir gateway
  * Add front UI
  * Add support for gitlab
  * Check whether root .dockerignore is used or if a .dockerignore in each directory is needed
