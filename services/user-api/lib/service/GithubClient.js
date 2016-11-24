const logger = require('tracer').colorConsole();

import Purest from 'purest';
const github = new Purest({provider: 'github', promise: true});
import {GithubApiError} from '../errors';

export function getUserProfile(user) {
  const {token} = user;

  return get('user', token)
    .request()
    .then(([response, profile]) => {
      if (response.statusCode !== 200) {
        throw new GithubApiError('user', response.body.message);
      }

      user.githubId = profile.id;
      user.name = profile.login;
      user.fullname = profile.name;

      return user;
    })
  ;
}

export function getUserRepositories(user) {
  const {token} = user;
  user.repositories = null;

  return get('user/repos', token)
    .where()
    .request()
    .then(([response, repositories]) => {
      if (response.statusCode !== 200) {
        throw new GithubApiError('user/repos', response.body.message);
      }

      user.repositories = filterForkRepositories(repositories);

      return user;
    })
  ;
}

function get(path, token) {
  return github
    .query()
    .options({"headers": {"User-Agent": "Local ContinuousQA"}})
    .get(path)
    .auth(token)
  ;
}

function filterForkRepositories(repositories) {
  return repositories
    .filter(repository => repository.fork === false)
    .map(({id: githubId, full_name: name, html_url: publicUrl, clone_url: cloneUrl}) => {
      return {githubId, name, publicUrl, cloneUrl};
    })
  ;
}
