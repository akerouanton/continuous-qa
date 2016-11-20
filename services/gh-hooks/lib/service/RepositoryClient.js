const request = require('request');
const config = require('config');
const Promise = require('promise');
const get = Promise.denodeify(require('request').get);
const logger = require('tracer').colorConsole();

import {RepositoryApiError, RepositoryNotFoundError} from '../errors';

export function fetchRepository(repositoryName) {
  const url = `${config.repositoriesEndpoint}`;
  const qs = {type: 'github', name: repositoryName};
  const headers = {'Content-Type': 'application/json'};

  return get({url, qs, headers})
    .then((response) => {
      if (response.statusCode !== 200) {
        throw new RepositoryApiError(repositoryName, response.statusCode, response.body);
      }

      const repositories = JSON.parse(response.body);
      if (repositories.length !== 1) {
        throw new RepositoryNotFoundError(repositoryName);
      }

      return repositories[0];
    })
  ;
}
