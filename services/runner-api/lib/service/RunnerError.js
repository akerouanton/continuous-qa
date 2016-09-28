import ExtendableError from 'es6-error';

export class RunnerError extends ExtendableError {
  constructor(message, previous = null) {
    super(message);
    this.previous = previous;
  }
}

export class AnalyzerNotSupportedError extends RunnerError {
  constructor(analyzer, previous = null) {
    super(`Analyzer "${analyzer}" is not supported.`, previous);
  }
}

export class RunnerAlreadyExistsError extends RunnerError {
  constructor(normalizedName, buildUrn, analyzer, previous = null) {
    super(`Runner "${normalizedName}" for "${buildUrn}:${analyzer}" already exists.`, previous);
  }
}

export class RunnerNotFoundError extends RunnerError {
  constructor(buildUrn, analyzer, previous = null) {
    super(`Runner for "${buildUrn}:${analyzer}" not found.`, previous);
  }
}
