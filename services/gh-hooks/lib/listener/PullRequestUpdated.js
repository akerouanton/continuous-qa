const logger = require('tracer').colorConsole();

import * as RepositoryClient from '../service/RepositoryClient';
import * as BuildClient from '../service/BuildClient';

export function handle(event) {
  if (event.action !== 'opened' && event.action !== 'synchronize') {
    return;
  }

  const repoName = event.pull_request.head.repo.full_name;
  const repoUrl = event.pull_request.head.repo.html_url;
  const branch = event.pull_request.head.ref;
  const ref = event.pull_request.head.sha;

  return RepositoryClient
    .fetchRepository(repoName)
    .then(repository => BuildClient.createBuild({repoUrn: repository.urn, repoUrl, branch, ref}))
  ;
}
