import GithubClient from '../service/GithubClient';
import UserRepository from '../service/UserRepository';

/**
 * @api {get} /connected OAuth redirect endpoint
 * @apiName Connected
 * @apiGroup user-api
 * @apiVersion 0.1.0
 * @apiError (401) UnauthenticatedError
 */
export default class {
  static handle(req, res, next) {
    if (false === "grant" in req.session || false === "response" in req.session.grant) {
      res.status(401).json({ error: 'UnauthenticatedError' });
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

        res.json(user.toObject());
        res.end();
      })
      .catch((err) => {
        next(err);
      })
    ;
  }
}
