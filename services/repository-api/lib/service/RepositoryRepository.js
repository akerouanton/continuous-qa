const logger = require('tracer').colorConsole();

import Repository from '../model/Repository';
import {RepositoryNotFoundError} from '../errors';

export function find(urn) {
  return Repository
    .findOne({urn})
    .exec()
  ;
}

export function get(urn) {
  return find(urn)
    .then((repository) => {
      if (repository === null) {
        throw new RepositoryNotFoundError(urn);
      }

      return repository;
    })
  ;
}

export function findAll({type, name}) {
  const params = {type};

  if (name) {
    params.name = name;
  }

  return Repository
    .find(params)
    .exec()
  ;
}
