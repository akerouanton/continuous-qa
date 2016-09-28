const config = require('config');
const chakram = require('chakram');
const expect = chakram.expect;

function getUrl(urn) {
  return `http://localhost:${config.httpPort}/logs/${encodeURIComponent(urn)}`;
}

describe('GetLogs endpoint', function () {
  it('should provide logs for a specific analysis', function () {
    const urn = 'urn:gh:knplabs/gaufrette:1:php-cs-fixer';
    const response = chakram.get(getUrl(urn));

    return expect(response).to.have.status(200).json([
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "echo \"Cloning ${REPO_URL} into $(pwd)\"\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "pwd\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "Cloning https://github.com/knplabs/gaufrette into /src\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "git clone --branch ${GIT_REF} ${REPO_URL} .\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "Cloning into '.'...\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "~/.composer/vendor/bin/php-cs-fixer --diff --dry-run -v --format=xml fix src/ >/artifacts/php-cs-fixer.xml\n"
      }
    ]);
  });

  it('denies request when urn is invalid', function () {
    const urn = 'urn:gh:blabla';
    const response = chakram.get(getUrl(urn));

    return expect(response).to.have.status(400).json({error: 'UrnNotValid'});
  });
});
