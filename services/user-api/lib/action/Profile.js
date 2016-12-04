import * as GithubClient from '../service/GithubClient';
import * as Responders from '../responders';
import * as UserRepository from '../service/UserRepository';
import * as VaultClient from '../service/VaultClient';
import {GithubApiError, HttpServerError} from '../errors';

/**
 * @api {get} /profile Get user profile
 * @apiName Profile
 * @apiParam {Integer} githubId
 * @apiGroup user-api
 * @apiVersion 0.2.0
 * @apiError (401) Unauthorized
 */
export function handle(req, res, next) {
  const githubId = req.user !== undefined ? req.user.githubId : req.param.githubId;

  UserRepository
    .getByGithubId(githubId)
    .then(VaultClient.retrieveUserToken)
    .then(GithubClient.getUserProfile)
    .then(GithubClient.getUserRepositories)
    .then((user) => {
      res.format({
        'application/json': () => Responders.json(res.status(200), user),
        'application/hal+json': () => Responders.hal(res.status(200), user),
        'default': () => res.sendStatus(406).end()
      });
    })
    .catch((err) => {
      if (err instanceof GithubApiError) {
        return next(new HttpServerError(err.message));
      }

      return next(err);
    })
  ;
}
