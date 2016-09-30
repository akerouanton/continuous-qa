const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');

function getUrl(urn) {
  return `http://localhost:${config.httpPort}/pipeline/${encodeURIComponent(urn)}`;
}

describe('GetPipeline', function () {
  it('retrieves a given pipeline', function () {
    const urn = 'urn:gh:knplabs/gaufrette:feature/*';
    const response = chakram.get(getUrl(urn));

    return expect(response).to.have.status(200).json({
      projectUrn: "urn:gh:knplabs/gaufrette",
      pattern: 'feature/*',
      stages: [
        {runners: ['php-cs-fixer', 'phpqa']}
      ]
    });
  });

  it('returns a 400 for malformed pipeline urn', function () {
    const urn = 'urn:gh:knplabs/gaufrette:';
    const response = chakram.get(getUrl(urn));

    return expect(response).to.have.status(400).json({error: 'UrnNotValid'});
  });

  it('returns a 404 for an unknown pipeline', function () {
    const urn = 'urn:gh:knplabs/gaufrette:unknown';
    const response = chakram.get(getUrl(urn));

    return expect(response).to.have.status(404).json({error: 'PipelineNotFound'});
  });
});
