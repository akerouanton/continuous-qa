const jwt = require('jsonwebtoken');
const {secret} = require('config');

import * as GithubClient from '../service/GithubClient';
import * as UserRepository from '../service/UserRepository';
import * as VaultClient from '../service/VaultClient';
import {GithubApiError, HttpServerError} from '../errors';

export default function handle(req, res, next) {
  req.params.token = null;

  if (false === ("grant" in req.session) || false === ("response" in req.session.grant)) {
    return next();
  }

  const token = req.session.grant.response.access_token;

  GithubClient
    .getUserProfile({token})
    .then(VaultClient.storeUserToken)
    .then(UserRepository.upsert)
    .then((user) => {
      const payload = {name: user.name, githubId: user.githubId};

      return jwt.sign(payload, secret, {}, (err, token) => {
        if (err) {
          throw new HttpServerError(err.message);
        }

        // req.session.destroy();
        req.params.token = token;
        res.header('X-Auth-Token', token);

        next();
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
