const Promise = require('promise');
const request = require('request');
const get = Promise.denodeify(request.get);
const config = require('config');
const logger = require('tracer').colorConsole();
const _ = require('underscore');

export function fetchPlugin(name) {
  logger.debug(`Fetching plugin "${name}".`);

  return get({url: `${config.endpoints.plugin}/${encodeURIComponent(name)}`})
    .then((response) => {
      logger.debug(response.statusCode, response.body);
      if (response.statusCode === 404) {
        throw new Error(`Plugin "${name}" does not exists.`);
      } else if (response.statusCode !== 200) {
        throw new Error(`Unable to fetch plugin "${name}".`);
      }

      logger.debug(`Plugin "${name}" fetched.`);
      return JSON.parse(response.body);
    })
  ;
}

export function getPluginEndpoint(name, endpointName) {
  return fetchPlugin(name)
    .then((plugin) => {
      const endpoint = plugin.endpoints[endpointName];

      if (endpoint === undefined) {
        throw new Error(`Plugin "${name}" does not provide any "${endpointName}" endpoint.`);
      }

      return endpoint.replace(/\/$/, '');
    })
  ;
}

export function getRunnerPlatform(runner) {
  return fetchPlugin(runner)
    .then(plugin => plugin.platform)
  ;
}

export function enrichPipeline(pipeline) {
  const getPlatform = _.memoize(getRunnerPlatform);
  const promises = [];

  _.map(pipeline.stages, (stage) => {
    _.map(stage.tasks, task => {
      const promise = getPlatform(task.runner)
        .then(platform => task.platform = platform)
      ;

      promises.push(promise);
    });
  });

  return Promise.all(promises).then(() => {
    logger.debug(pipeline.stages[0]);
    return pipeline;
  });
}
