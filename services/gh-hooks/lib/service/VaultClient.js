const config = require('config');
const vault = require('node-vault')(config.vault);
const logger = require('tracer').colorConsole();

export function retrieveUserToken(githubId) {
  logger.debug(`Retrieving oauth token for user "${githubId}".`);

  return vault
    .read(`${config.vault.backendPrefix}/${githubId}/token`)
    .then((result) => {
      const {data: {value: token}} = result;
      logger.debug(`OAuth token for user "${githubId}" fetched.`);

      return token;
    })
  ;
}
