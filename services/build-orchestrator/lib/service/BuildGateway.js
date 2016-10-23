const Promise = require('promise');
const request = require('request');
const get = Promise.denodeify(request.get);
const post = Promise.denodeify(request.post);
const config = require('config');
const logger = require('tracer').colorConsole();

export function fetchBuild(buildUrn) {
  logger.debug(`Fetching build "${buildUrn}".`);

  return get(`${config.endpoints.build}/${encodeURIComponent(buildUrn)}`)
    .then((build) => {
      if (build.statusCode !== 200) {
        throw new Error('Unable to fetch build.');
      }

      logger.debug(`Build "${buildUrn}" fetched.`);
      return JSON.parse(build.body);
    })
  ;
}

export function runBuild(buildUrn, stages) {
  const url = `${config.endpoints.build}/${encodeURIComponent(buildUrn)}/run`;
  logger.debug(`Starting build "${buildUrn}" with ${stages.length} stage(s).`);

  return post({url, form: {stages}})
    .then((response) => {
      if (response.statusCode !== 200) {
        throw new Error('Unable to run build.');
      }

      logger.debug(`Build "${buildUrn}" started.`);
      return JSON.parse(response.body);
    });
}

export function updateRunnerState({buildUrn, stage, runnerType, exitCode, state}) {
  const url = `${config.endpoints.build}/${encodeURIComponent(buildUrn)}/${stage}/${runnerType}`;
  const form = {state};
  logger.debug(`Updating build "${buildUrn}" status, form: "${JSON.stringify(form)}".`);

  return post({url, form}).then(response => {
    console.log(response.statusCode, response.body);
    if (response.statusCode !== 200) {
      throw new Error(
        'An error occured while updating build status.',
        { runnerUrn: runner.runnerUrn, url: url, state: state, statusCode: response.statusCode, body: response.body }
      );
    }

    logger.debug(`Build "${buildUrn}" status updated.`);
    return JSON.parse(response.body);
  });
}
