const Promise = require('promise');
const request = require('request');
const put = Promise.denodeify(request.put);
const del = Promise.denodeify(request.delete);
const config = require('config');
const logger = require('tracer').colorConsole();

export function startTaskRunner(endpoint, taskUrn, runner, metadata, envVars) {
  const url = `${endpoint}/${encodeURIComponent(taskUrn)}`;
  const form = {runner, metadata, envVars};
  logger.debug(`Starting task runner for "${taskUrn}".`, {url, form});

  return put({url, form})
    .then((response) => {
      if (response.statusCode !== 201) {
        throw new Error('Unable to start task runner.');
      }

      logger.debug(`Task runner for "${taskUrn}" started.`);
    })
  ;
}

export function dropTaskRunner(endpoint, taskUrn) {
  const url = `${endpoint}/${encodeURIComponent(taskUrn)}`;
  logger.debug(`Dropping task runner for "${taskUrn}".`, {url});

  return del({url}).then((response) => {
    if (response.statusCode !== 204) {
      throw new Error('An error occurred while dropping runner.', {url});
    }

    logger.debug(`Task runner for "${taskUrn}" dropped.`);
  });
}
