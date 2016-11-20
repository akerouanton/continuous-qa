const logger = require('tracer').colorConsole();

import * as GithubClient from '../service/GithubClient';
import * as VaultClient from '../service/VaultClient';

export function handle(event, headers) {
  const {name, type} = event;

  if (type !== 'github') {
    return;
  }

  const {githubId} = headers['X-CQA-User'];

  return VaultClient
    .retrieveUserToken(githubId)
    .then(token => GithubClient.createHook(token, name, ['pull_request', 'push']))
  ;
}
