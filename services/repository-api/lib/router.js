const express = require('express');
const jwt = require('express-jwt');
const config = require('config');
const _ = require('underscore');

import * as AddRepository from './action/AddRepository';
import * as ListRepositories from './action/ListRepositories';
import * as RetrieveRepository from './action/RetrieveRepository';
import {validateRepositoryUrn} from './service/HttpParamHandler';

export default function router(exchange) {
  const router = express.Router();

  const addRepositoryMiddlewares = [
    AddRepository.fetchOauthToken,
    AddRepository.validateRequest,
    _.partial(AddRepository.handleRequest, exchange)
  ];

  router.post('/repository', jwt({secret: config.secret}), addRepositoryMiddlewares);
  router.get('/repositories', [ListRepositories.validateRequest, ListRepositories.handleRequest]);
  router.get('/repository/:repositoryUrn', RetrieveRepository.handleRequest);

  router.param('repositoryUrn', validateRepositoryUrn);

  return router;
}
