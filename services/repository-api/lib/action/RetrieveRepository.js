import * as RepositoryRepository from '../service/RepositoryRepository';
import * as JsonResponder from '../responder/json';
import * as HalResponder from '../responder/hal';
import {HttpClientError, RepositoryNotFoundError} from '../errors';

/**
 * @api {get} /repository/:repositoryUrn Retrieve a repository
 * @apiName RetrieveRepository
 * @apiGroup repository-api
 * @apiVersion 0.1.0
 * @apiParam {String} repositoryUrn
 * @apiSuccess (200) {String} name
 * @apiSuccess (200) {String} type
 * @apiSuccess (200) {String} urn
 * @apiError (400) InvalidUrn
 */
export function handleRequest(req, res, next) {
  const {repositoryUrn} = req.params;

  RepositoryRepository
    .get(repositoryUrn)
    .then((repository) => {
      res.format({
        'application/json': () => JsonResponder.repository(res.status(200), repository),
        'application/hal+json': () => HalResponder.repository(res.status(200), repository),
        'default': () => res.sendStatus(406)
      })
    })
    .catch((err) => err instanceof RepositoryNotFoundError ? next(new HttpClientError('RepositoryNotFound')) : next(err))
  ;
}
