const GithubApi = require('github');
const logger = require('tracer').colorConsole();

import {GithubApiError} from '../errors';

export function createDeployKey(token, repository) {
  logger.debug(`Creating deploy key for repository "${repository.name}".`);
  const github = createGithubClient(token);
  const [owner, repo] =  repository.name.split('/');

  return github
    .repos
    .createKey({owner, repo, title: 'ContinuousQA', key: repository.keyPair.publicKey, read_only: true})
    .then((response) => {
      if (response.meta.status !== '201 Created') {
        throw new GithubApiError(`/repos/${repository.name}/keys`, '');
      }

      logger.debug(`Deploy key for repository "${repository.name}" created.`);
      repository.deployKeyId = response.id;

      return repository;
    })
  ;
}

export function removeDeployKey(token, repository) {
  logger.debug(`Removing deploy key for repository "${repository.name}".`);
  const github = createGithubClient(token);
  const [owner, repo] =  repository.name.split('/');

  return github
    .repos
    .deleteKey({owner, repo, id: repository.deployKeyId})
    .then((response) => {
      if (response.meta.status !== '204 No Content') {
        throw new GithubApiError(`/repos/${repository.name}/keys/${repository.deployKeyId}`, '');
      }

      logger.debug(`Deploy key "${repository.deployKeyId}" removed.`);
      repository.deployKeyId = null;
    })
}

function createGithubClient(token, timeout = 5000) {
  const github = new GithubApi({Promise, timeout, headers: {'User-Agent': 'Local ContinuousQA'}});
  github.authenticate({type: 'token', token});

  return github;
}
