const express = require('express');
const jwt = require('express-jwt');
const config = require('config');
const _ = require('underscore');
const logger = require('tracer').colorConsole();

import * as AddRepository from './action/AddRepository';
import * as ListRepositories from './action/ListRepositories';
import * as RetrieveRepository from './action/RetrieveRepository';
import * as RemoveRepository from './action/RemoveRepository';
import {validateRepositoryUrn} from './service/HttpParamHandler';
import * as VaultClient from './service/VaultClient';

export default function router(exchange) {
  const router = express.Router();

  router.post('/repositories', jwt({secret: config.secret}), [
    fetchOauthToken,
    AddRepository.validateRequest,
    _.partial(AddRepository.handleRequest, exchange)
  ]);
  router.get('/repositories', [ListRepositories.validateRequest, ListRepositories.handleRequest]);
  router.get('/repository/:repositoryUrn', RetrieveRepository.handleRequest);
  router.delete('/repository/:repositoryUrn', jwt({secret: config.secret}), [
    fetchOauthToken,
    RemoveRepository.handleRequest
  ]);

  router.param('repositoryUrn', validateRepositoryUrn);

  return router;
}

function fetchOauthToken(req, res, next) {
  logger.debug(`Fetching oauth token for user "${req.user.githubId}".`);

  VaultClient
    .retrieveUserToken(req.user.githubId)
    .then((token) => {
      req.user.oauthToken = token;
      next();
    })
    .catch(err => next(err))
  ;
}
