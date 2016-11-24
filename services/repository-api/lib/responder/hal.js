const _ = require('underscore');

import halson from 'halson';

export function repository(res, repository) {
  res.json(getRepositoryRepresentation(repository));
}

export function repositories(res, repositories) {
  res.json(getRepositoriesRepresentation(repositories));
}

function getRepositoryRepresentation({name, type, urn, enabled}) {
  return halson({name, type, urn, enabled})
    .addLink('self', `/repository/${encodeURIComponent(repository.urn)}`)
  ;
}

function getRepositoriesRepresentation(repositories) {
  return halson()
    .addLink('self', '/repositories')
    .addEmbed('repositories', _.map(repositories, getRepositoryRepresentation))
  ;
}
