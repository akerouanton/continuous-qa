const config = require('config');
const vault = require('node-vault')(config.vault);
const logger = require('tracer').colorConsole();

export function storeUserToken(user) {
  const {githubId, token} = user;
  logger.debug(`Writing user token into "${config.vault.backendPrefix}/${githubId}/token".`);

  return vault
    .write(`${config.vault.backendPrefix}/${githubId}/token`, {value: token, lease: '86000s'})
    .then(() => user)
  ;
}

export function retrieveUserToken(user) {
  const {githubId} = user;
  logger.debug(`Reading user token in "${config.vault.backendPrefix}/${githubId}/token".`);

  return vault
    .read(`${config.vault.backendPrefix}/${githubId}/token`)
    .then((result) => {
      const {data: {value: token}} = result;
      logger.debug(`Token for user "${githubId}" retrieved.`);
      user.token = token;

      return user;
    })
  ;
}
