import Purest from 'purest';

export class GithubClient {
  constructor() {
    this._github = new Purest({provider: 'github', promise: true});
  }

  getUserProfile(oauthToken) {
    return this
      .query()
      .get('user')
      .auth(oauthToken)
      .request()
      .then(([response, profile]) => {
        return {githubId: profile.id, name: profile.name};
      })
    ;
  }

  getUserRepositories(oauthToken) {
    return this
      .query()
      .get('user/repos')
      .where({visibility: 'public'})
      .auth(oauthToken)
      .request()
      .then(([response, repositories]) => {
        return repositories
          .filter((repository) => { return repository.fork === false; })
          .map((repository) => {
            return {
              githubId: repository.id,
              name: repository.full_name,
              publicUrl: repository.html_url,
              cloneUrl: repository.clone_url
            };
          })
      })
    ;
  }

  query() {
    return this
      ._github
      .query()
      .options({"headers": {"User-Agent": "Local ContinuousQA"}})
    ;
  }
}

export default new GithubClient();
