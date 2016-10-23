const Promise = require('promise');
const request = require('request');
const get = Promise.denodeify(request.get);
const config = require('config');
const logger = require('tracer').colorConsole();

export function fetchMatchingPipeline(projectUrn, branch) {
  const encodedUrn = encodeURIComponent(projectUrn);
  const encodedBranch = encodeURIComponent(branch);
  logger.debug(`Fetching pipeline matching "${branch}" for "${projectUrn}".`);

  return get(`${config.endpoints.pipeline}/${encodedUrn}/matching/${encodedBranch}`)
    .then((response) => {
      if (response.statusCode !== 200) {
        throw new Error('Unable to fetch pipeline.');
      }

      logger.debug(`Pipeline matching "${branch}" for "${projectUrn}" fetched.`);
      return JSON.parse(response.body);
    })
  ;
}
