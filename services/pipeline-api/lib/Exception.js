export class PipelineNotFound extends Error {
  constructor(projectUrn, pattern) {
    super(`Pipeline "${projectUrn}:${pattern}" not found.`);
  }
}

export class NoMatchingPipeline extends Error {
  constructor(projectUrn, branch) {
    super(`There is no pipeline matching branch "${branch}", for project "${projectUrn}".`);
  }
}
