import GithubClient from './GithubClient';
import UserRepository from './UserRepository';

export default class {
  static handle(req, res) {
    if (false === "grant" in req.session || false === "response" in req.session.grant) {
      res.redirect("/");
      res.end();

      return;
    }

    const token = req.session.grant.response.access_token;

    GithubClient
      .getUserProfile(token)
      .then((profileData) => {
        const profile = profileData;
        profile.token = token;

        return GithubClient
          .getUserRepositories(token)
          .then((repositories) => {
            profile.repositories = repositories;
            return profile;
          })
        ;
      })
      .then(UserRepository.createOrUpdate)
      .then((user) => {
        req.session.githubId = user.githubId;

        res.send(user.toObject());
        res.end();
      })
    ;
  }
}
