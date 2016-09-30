const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');
const exec = require('child_process').execSync;
const resolve = require('path').resolve;

function getUrl(urn) {
  return `http://localhost:${config.httpPort}/pipeline/${encodeURIComponent(urn)}`;
}

describe('CreatePipeline', function () {
  before(function () {
    this.timeout(15000);
    exec('make mongo-restore', {cwd: resolve(__dirname, '../../../..')});
  });

  it('creates a new pipeline for a given project', function () {
    const urn = 'urn:gh:knplabs/gaufrette:ci/*';
    const response = chakram.put(getUrl(urn));

    return expect(response).to.have.status(200).json({
      projectUrn: 'urn:gh:knplabs/gaufrette',
      pattern: 'ci/*',
      stages: [
        {runners: ['php-cs-fixer', 'phpqa']}
      ]
    });
  });

  it('returns a 400 for malformed pipeline urn', function () {
    const urn = 'urn:gh:knplabs/gaufrette:';
    const response = chakram.put(getUrl(urn));

    return expect(response).to.have.status(400).json({error: 'UrnNotValid'});
  });

  it('returns 409 when the branch pattern is already used for the same project', function () {
    const urn = 'urn:gh:knplabs/gaufrette:feature/*';
    const response = chakram.put(getUrl(urn));

    return expect(response).to.have.status(409).json({error: 'PipelineAlreadyExists'});
  });
});
