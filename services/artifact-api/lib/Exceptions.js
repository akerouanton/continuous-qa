export class ArtifactAlreadyExistsError {
  constructor(bucket, filename) {
    const message = 'File /' + bucket + '/' + filename + ' already exists.';

    this.name = 'ArtifactAlreadyExistsError';
    this.message = message;
    this.stack = Error.captureStackTrace(this, this.constructor);
  }
}
ArtifactAlreadyExistsError.prototype = Error.prototype;

export class EmptyUploadError {
  constructor(message) {
    this.name = 'EmptyUploadError';
    this.message = message;
    this.stack = Error.captureStackTrace(this, this.constructor);
  }
}
EmptyUploadError.prototype = Error.prototype;
