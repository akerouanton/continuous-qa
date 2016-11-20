const logger = require('tracer').colorConsole();

import * as RepositoryRepository from '../service/RepositoryRepository';
import * as JsonResponder from '../responder/json';
import * as HalResponder from '../responder/hal';
import {InvalidTypeError} from '../errors';

/**
 * @api {get} /repositories
 * @apiName ListRepositories
 * @apiGroup repository-api
 * @apiVersion 0.1.0
 * @apiParam {String} name Optional query string
 * @apiParam {String} type Optional query string, only <code>github</code> supported for now
 * @apiSuccess (200) {Object[]} repositories
 * @apiSuccess (200) {String}   repositories.name
 * @apiSuccess (200) {String}   repositories.type
 * @apiSuccess (200) {String}   repositories.urn
 * @apiError (400) InvalidType
 */
export function handleRequest(req, res, next) {
  const {type: type = 'github', name: name = null} = req.query;

  RepositoryRepository
    .findAll({type, name})
    .then((repositories) => {
      res.format({
        'application/json': () => JsonResponder.repositories(res.status(200), repositories),
        'application/hal+json': () => HalResponder.repositories(res.status(200), repositories),
        'default': () => res.sendStatus(406)
      });
    })
    .catch(err => next(err))
  ;
}

export function validateRequest(req, res, next) {
  const {type: type = null} = req.query;

  if (type !== null && type !== 'github') {
    return next(new InvalidTypeError());
  }

  next();
}
