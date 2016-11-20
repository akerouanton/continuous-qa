const config = require('config');
const vault = require('node-vault')(config.vault);
const logger = require('tracer').colorConsole();

export function retrieveUserToken(githubId) {
  logger.debug(`Reading user token in "${config.vault.backendPrefix}/${githubId}/token".`);

  return vault
    .read(`${config.vault.backendPrefix}/${githubId}/token`)
    .then((result) => {
      const {data: {value: token}} = result;
      logger.debug(`Token for user "${githubId}" retrieved.`);

      return token;
    })
  ;
}

export function storePrivateKey(repository) {
  logger.debug(`Storing private key for projet "${repository.name}".`);
  const url = `${config.vault.backendPrefix}/repositories/${encodeURIComponent(repository.name)}/key`;

  return vault
    .write(url, {value: repository.keyPair.privateKey, lease: '0s'})
    .then(() => {
      logger.debug(`Private key for repository "${repository.name}" stored.`);

      return repository;
    })
  ;
}
