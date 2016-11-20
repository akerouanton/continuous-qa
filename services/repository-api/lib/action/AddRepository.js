const logger = require('tracer').colorConsole();
const _ = require('underscore');

import Repository from '../model/Repository';
import * as JsonResponder from '../responder/json';
import * as HalResponder from '../responder/hal';
import {MissingNameError, MissingTypeError, InvalidTypeError, HttpClientError} from '../errors';
import * as Persister from '../service/RepositoryPersister';
import * as GithubClient from '../service/GithubClient';
import * as VaultClient from '../service/VaultClient';
import * as KeyGenerator from '../service/KeyGenerator';
import * as EventPublisher from '../service/EventPublisher';

/**
 * @api {post} /repository Add a new repository
 * @apiName AddRepository
 * @apiGroup repository-api
 * @apiVersion 0.1.0
 * @apiParam {String} name
 * @apiParam {String} type Only <code>github</code> supported for now
 * @apiSuccess (200) {String} name
 * @apiSuccess (200) {String} type
 * @apiSuccess (200) {String} urn
 * @apiError (400) MissingName
 * @apiError (400) MissingType
 * @apiError (400) InvalidType
 * @apiError (400) NameAlreadyInUse
 */
export function handleRequest(exchange, req, res, next) {
  const {name, type} = req.body;
  const repository = new Repository({name, type});

  KeyGenerator
    .generatePassphrase(repository)
    .then(KeyGenerator.generateKeyPair)
    .then(_.partial(GithubClient.createDeployKey, req.user.oauthToken))
    .then(VaultClient.storePrivateKey)
    .then(Persister.save)
    .then((repository) => {
      const payload = {urn: repository.urn, name: repository.name, type: repository.type};
      const user = _.clone(req.user);
      delete user.oauthToken;
      delete user.iat;

      EventPublisher.publishEvent(exchange, 'repository.added', payload, user);

      return repository;
    })
    .then((repository) => {
      res.location(`/repository/${encodeURIComponent(repository.urn)}`).format({
        'application/json': () => JsonResponder.repository(res.status(201), repository),
        'application/hal+json': () => HalResponder.repository(res.status(201), repository),
        'default': () => res.sendStatus(406)
      }).end();
    })
    .catch((err) => {
      logger.debug(err);
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new HttpClientError('NameAlreadyInUse'));
      }

      next(err);
    })
  ;
}

export function validateRequest(req, res, next) {
  const {name = null, type = null} = req.body;
  if (name === null) {
    return next(new MissingNameError());
  } else if (type === null) {
    return next(new MissingTypeError());
  } else if (type !== 'github') {
    return next(new InvalidTypeError());
  }

  next();
}

export function fetchOauthToken(req, res, next) {
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
