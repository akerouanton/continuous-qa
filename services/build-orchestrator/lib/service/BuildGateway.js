const Promise = require('promise');
const request = require('request');
const get = Promise.denodeify(request.get);
const post = Promise.denodeify(request.post);
const patch = Promise.denodeify(request.patch);
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
  logger.debug(`Starting build "${buildUrn}" with ${stages.length} stage(s).`, stages[0].tasks);

  return post({url, form: {stages}})
    .then((response) => {
      if (response.statusCode !== 200) {
        throw new Error(`Unable to run build. Response: ${response.body}`);
      }

      logger.debug(`Build "${buildUrn}" started.`);
      return JSON.parse(response.body);
    });
}

export function changeBuildState(buildUrn, state) {
  const url = `${config.endpoints.build}/${encodeURIComponent(buildUrn)}`;
  logger.debug(`Changing build state to "${state}" for build "${buildUrn}".`);

  return patch({url, form: {state}})
    .then()
  ;
}

export function updateTaskState({buildUrn, stageId, taskName, state}) {
  const url = `${config.endpoints.build}/${encodeURIComponent(buildUrn)}/${stageId}/${taskName}`;
  const form = {state};
  logger.debug(`Updating build "${buildUrn}" status, form: "${JSON.stringify(form)}".`);

  return post({url, form}).then(response => {
    logger.debug(response.statusCode, response.body);
    if (response.statusCode !== 200) {
      throw new Error(
        'An error occurred while updating build status.',
        {buildUrn, stageId, taskName, state}
      );
    }

    logger.debug(`Build "${buildUrn}" status updated.`);
    return JSON.parse(response.body);
  });
}
