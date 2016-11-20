const config = require('config');
const Promise = require('promise');
const post = Promise.denodeify(require('request').post);
const logger = require('tracer').colorConsole();

export function createBuild({repoUrn, repoUrl, branch, ref}) {
  const url = `${config.buildEndpoint}/${encodeURIComponent(repoUrn)}/new`;

  post({url: url, form: {projectUrn: repoUrn, repoUrl, branch, ref}})
    .then((response) => {
      if (response.statusCode !== 200) {
        logger.error(
          'An error occurred while creating a new build.',
          {url: repoUrl, repoUrl: url, ref, statusCode: response.statusCode, body: response.body}
        );
        return;
      }

      const build = JSON.parse(response.body);
      logger.debug(`Build "${build.urn}" has been created.`);

      return build;
    })
  ;
}
