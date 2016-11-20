const _ = require('underscore');

export function repository(res, repository) {
  res.json(getRepositoryRepresentation(repository));
}

export function repositories(res, repositories) {
  res.json(getRepositoriesRepresentation(repositories));
}

function getRepositoryRepresentation(repository) {
  return {name: repository.name, type: repository.type, urn: repository.urn};
}

function getRepositoriesRepresentation(repositories) {
  return _.map(repositories, getRepositoryRepresentation);
}
