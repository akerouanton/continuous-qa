const Promise = require('promise');
const request = require('request');
const put = Promise.denodeify(request.put);
const _delete = Promise.denodeify(request.delete);
const config = require('config');
const logger = require('tracer').colorConsole();

export function startRunner(runnerUrn, runnerType, metadata, envVars) {
  const url = `${config.endpoints.runner}/${encodeURIComponent(runnerUrn)}`;
  const form = {runnerType, metadata, envVars};
  logger.debug(`Starting runner "${runnerUrn}" (url: "${url}", form: "${JSON.stringify(form)}".`);

  return put({url, form})
    .then((response) => {
      console.log(response.statusCode);
      if (response.statusCode !== 201) {
        throw new Error('Unable to start runner.');
      }
      logger.debug(`Runner "${runnerUrn}" started.`);
    })
  ;
}

export function dropRunner({runnerUrn}) {
  const url = `${config.endpoints.runner}/${encodeURIComponent(runnerUrn)}`;
  logger.debug(`Dropping runner "${runnerUrn}".`);

  return _delete({url}).then((response) => {
    if (response.statusCode !== 204) {
      throw new Error('An error occurred while dropping runner.', {url: url, runner: runner});
    }
    logger.debug(`Runner "${runnerUrn}" dropped.`);
  });
}
