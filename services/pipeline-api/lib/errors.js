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

export class PipelineNotFound extends ExtendableError {
  constructor(projectUrn, pattern) {
    super(`Pipeline "${projectUrn}:${pattern}" not found.`);
  }
}
export class NoMatchingPipeline extends ExtendableError {
  constructor(projectUrn, branch) {
    super(`There is no pipeline matching branch "${branch}" for project "${projectUrn}".`);
  }
}
