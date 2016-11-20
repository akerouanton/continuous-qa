import ExtendableError from 'es6-error';

export class HttpError {
  constructor(reason, statusCode) {
    this._reason = reason;
    this._statusCode = statusCode;
  }

  get reason() {
    return this._reason;
  }

  get statusCode() {
    return this._statusCode;
  }
}

export class HttpClientError extends HttpError {
  constructor(reason, statusCode = 400) {
    super(reason, statusCode);
  }
}

export class HttpServerError extends HttpError {
  constructor(reason = null, statusCode = 500) {
    super(reason, statusCode);
  }
}

export class MissingNameError extends HttpClientError {
  constructor() {
    super('MissingName');
  }
}

export class MissingTypeError extends HttpClientError {
  constructor() {
    super('MissingType');
  }
}

export class InvalidTypeError extends HttpClientError {
  constructor() {
    super('InvalidType');
  }
}

export class RepositoryNotFoundError extends ExtendableError {
  constructor(urn) {
    super(`Unable to find a repository with urn "${urn}".`);
  }
}

export class GithubApiError extends ExtendableError {
  constructor(path, reason) {
    super(`Call to "${path}" failed with error: "${reason}".`);
  }
}
