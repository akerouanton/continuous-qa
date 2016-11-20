const logger = require('tracer').colorConsole();
const GithubApi = require('github');
const config = require('config');

import {GithubApiError} from '../errors';

export function createHook(token, repoName, events) {
  logger.debug(`Creating webhook for repository "${repoName}".`);
  const github = new GithubApi({Promise, timeout: 5000, headers: {'User-Agent': 'Local ContinuousQA'}});
  github.authenticate({type: 'token', token});

  const [owner, repo] = repoName.split('/');
  const hookConfig = {url: `http://${config.host}/hook/gh`, content_type: 'json', secret: config.secret};

  return github
    .repos
    .createHook({owner, repo, events, name: 'web', active: true, config: hookConfig})
    .then((response) => {
      if (response.meta.status !== '201 Created') {
        throw new GithubApiError(`/repos/${repoName}/hooks`, response.body);
      }

      logger.debug(`Webhook for repository "${repoName}" has been created.`);
    })
  ;
}
