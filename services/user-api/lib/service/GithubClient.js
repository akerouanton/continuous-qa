const logger = require('tracer').colorConsole();
const GithubApi = require('github');
const config = require('config');

export function getUserProfile(user) {
  const github = new GithubApi({Promise, timeout: config.github.timeout, headers: {'User-Agent': config.github.user_agent}});
  github.authenticate({type: 'token', token: user.token});

  return github.users.get({})
    .then((profile) => {
      user.githubId = profile.id;
      user.name = profile.login;
      user.fullname = profile.name;

      return user;
    })
  ;
}

export async function getUserRepositories(user) {
  user.repositories = null;

  const headers = {'User-Agent': config.github.user_agent};
  const github = new GithubApi({Promise, timeout: config.github.timeout, headers});
  github.authenticate({type: 'token', token: user.token});

  let repositories = await github.repos.getAll({});
  user.repositories = filterForkRepositories(repositories);

  while (github.hasNextPage(repositories)) {
    repositories = await github.getNextPage(repositories, headers);
    user.repositories = [].concat(user.repositories, filterForkRepositories(repositories));
  }

  return user;
}

function filterForkRepositories(repositories) {
  return repositories
    .filter(repository => repository.fork === false)
    .map(({id: githubId, full_name: name, html_url: publicUrl, clone_url: cloneUrl}) => {
      return {githubId, name, publicUrl, cloneUrl};
    })
  ;
}
