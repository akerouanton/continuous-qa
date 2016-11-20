import ExtendableError from 'es6-error';

export class PipelineNotFoundError extends ExtendableError {
  constructor(projectUrn, branch) {
    super(`Unable to find a pipeline for project "${projectUrn}", matching branch "${branch}".`);
  }
}

