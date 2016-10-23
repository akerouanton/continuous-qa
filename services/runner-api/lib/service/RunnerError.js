import ExtendableError from 'es6-error';

export class RunnerError extends ExtendableError {
  constructor(message, previous = null) {
    super(message);
    this.previous = previous;
  }
}

export class RunnerTypeNotSupportedError extends RunnerError {
  constructor(runnerType, previous = null) {
    super(`Runner type "${runnerType}" is not supported.`, previous);
  }
}

export class RunnerAlreadyExistsError extends RunnerError {
  constructor(normalizedName, runnerUrn, previous = null) {
    super(`Runner "${normalizedName}" for "${runnerUrn}" already exists.`, previous);
  }
}

export class RunnerNotFoundError extends RunnerError {
  constructor(runnerUrn, previous = null) {
    super(`Runner for "${runnerUrn}" not found.`, previous);
  }
}
