const GithubApi = require('github');
const logger = require('tracer').colorConsole();

import {GithubApiError} from '../errors';

export function createDeployKey(token, repository) {
  logger.debug(`Creating deploy key for repository "${repository.name}".`);
  const github = new GithubApi({Promise, timeout: 5000, headers: {'User-Agent': 'Local ContinuousQA'}});
  github.authenticate({type: 'token', token});

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
