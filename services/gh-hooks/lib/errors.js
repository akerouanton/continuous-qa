import ExtendableError from 'es6-error';

export class HttpClientError {
  constructor(reason, statusCode = 400) {
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

export class RepositoryNotFoundError extends ExtendableError {
  constructor(repositoryName) {
    super(`Unable to find a github repository named "${repositoryName}".`);
  }
}

export class RepositoryApiError extends ExtendableError {
  constructor(repositoryName, statusCode, error) {
    super(`An error happened while requesting the repository api for repo "${repositoryName}".`, statusCode, error);
  }
}

export class GithubApiError extends ExtendableError {
  constructor(path, reason) {
    super(`Call to "${path}" failed with error: "${reason}".`);
  }
}
