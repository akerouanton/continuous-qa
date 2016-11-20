import {HttpClientError} from '../errors';

export function validateProjectUrn(req, res, next, urn) {
  if (/^urn:cqa:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/.test(urn)) {
    return next();
  }

  next(new HttpClientError('UrnNotValid'));
}


export function validatePattern(req, res, next, branch) {
  if (/^[a-zA-Z0-9_\-\/\*]+$/.test(branch)) {
    return next();
  }

  next(new HttpClientError('InvalidPattern'));
}

export function validateBranch(req, res, next, branch) {
  if (/^[a-zA-Z_\-\/]+$/.test(branch)) {
    return next();
  }

  next(new HttpClientError('InvalidBranch'));
}
