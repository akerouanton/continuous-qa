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
