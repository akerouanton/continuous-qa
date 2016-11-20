const Promise = require('bluebird');
const randomBytes = Promise.promisify(require('crypto').randomBytes);
const logger = require('tracer').colorConsole();
const forge = require('node-forge')({disableNativeCode: true});
const generateRsaKeyPair = Promise.promisify(forge.rsa.generateKeyPair);

export function generatePassphrase(repository, length = 12) {
  return randomBytes(length).then((passphrase) => {
    repository.passphrase = passphrase.toString('hex');
    return repository;
  });
}

export function generateKeyPair(repository) {
  logger.debug(`Generating key pair for repository "${repository.name}".`);

  return generateRsaKeyPair({bits: 2048})
    .then(({publicKey, privateKey}) => {
      repository.keyPair = {
        publicKey: forge.ssh.publicKeyToOpenSSH(publicKey),
        privateKey: forge.ssh.privateKeyToOpenSSH(privateKey, repository.passphrase)
      };

      logger.debug(`Key pair for repository "${repository.name}" generated.`);
      return repository;
    })
  ;
}
