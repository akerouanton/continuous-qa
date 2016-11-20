import {HttpClientError} from '../errors';

export function validateRepositoryUrn(req, res, next, urn) {
  if (/^urn:cqa:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/.test(urn)) {
    return next();
  }

  next(new HttpClientError('InvalidUrn'));
}
