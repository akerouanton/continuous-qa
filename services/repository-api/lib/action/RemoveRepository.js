import * as GithubClient from '../service/GithubClient';
import * as RepositoryRepository from '../service/RepositoryRepository';
import * as JsonResponder from '../responder/json';
import * as HalResponder from '../responder/hal';
import {RepositoryNotFoundError, HttpClientError} from '../errors';

/**
 * @api {delete} /repository/:repositoryUrn Add a new repository
 * @apiName AddRepository
 * @apiGroup repository-api
 * @apiVersion 0.1.0
 * @apiParam {String} repositoryUrn
 * @apiError (400) InvalidUrn
 */
export async function handleRequest(req, res, next) {
  try {
    const repository = await RepositoryRepository.get(req.params.repositoryUrn);

    if (!repository.enabled) {
      throw new HttpClientError('RepositoryDisabled');
    }

    repository.enabled = false;
    await GithubClient.removeDeployKey(req.user.oauthToken, repository);
    await repository.save();

    res.location(`/repository/${encodeURIComponent(repository.urn)}`).format({
      'application/json': () => JsonResponder.repository(res.status(204), repository),
      'application/hal+json': () => HalResponder.repository(res.status(204), repository),
      'default': () => res.sendStatus(406)
    }).end();
  } catch (err) {
    if (err instanceof RepositoryNotFoundError) {
      return next(new HttpClientError('RepositoryNotFound', 404));
    }

    next(err);
  }
}
