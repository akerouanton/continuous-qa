const _ = require('underscore');

export function repository(res, repository) {
  res.json(getRepositoryRepresentation(repository));
}

export function repositories(res, repositories) {
  res.json(getRepositoriesRepresentation(repositories));
}

function getRepositoryRepresentation({name, type, urn, enabled}) {
  return {name, type, urn, enabled};
}

function getRepositoriesRepresentation(repositories) {
  return _.map(repositories, getRepositoryRepresentation);
}
