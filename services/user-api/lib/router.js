const express = require('express');
const jwt = require('express-jwt');
const {secret} = require('config');

import GenerateToken from './middleware/GenerateToken';
import * as Profile from './action/Profile';

/**
 * @api {get} /connect/github Connect via Github
 * @apiName GithubConnect
 * @apiGroup user-api
 * @apiVersion 0.1.0
 */
export default function router() {
  const router = express.Router();

  router.get('/profile', GenerateToken, jwt({secret, getToken}), Profile.handle);

  return router;
}

function getToken(req) {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');

    if (parts.length == 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      } else {
        throw new UnauthorizedError('credentials_bad_scheme', {message: 'Format is Authorization: Bearer [token]'});
      }
    }
  } else if (req.params && req.params.token) {
    return req.params.token;
  }
}
