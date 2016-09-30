const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');

function getUrl(projectUrn, branch) {
  return `http://localhost:${config.httpPort}/pipelines/${encodeURIComponent(projectUrn)}/matching/${branch}`;
}

describe('FindMatchingPipeline', function () {
  const projectUrn = 'urn:gh:knplabs/gaufrette';

  it('finds the most relevant pipeline based on branch name', function () {
    const response = chakram.get(getUrl(projectUrn, 'master'));

    return expect(response).to.have.status(200).json({
      projectUrn: 'urn:gh:knplabs/gaufrette',
      pattern: 'master',
      stages: [
        {runners: ['php-cs-fixer', 'phpqa']}
      ]
    });
  });

  it('returns 404 if no pipeline match the branch name', function () {
    const response = chakram.get(getUrl(projectUrn, 'no-matching-pattern'));

    return expect(response).to.have.status(404).json({error: 'NoMatchingPipelineFound'});
  });
});
