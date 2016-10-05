const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');
const exec = require('child_process').execSync;
const resolve = require('path').resolve;

function getUrl(buildUrn) {
  return `http://localhost:${config.httpPort}/build/${encodeURIComponent(buildUrn)}`;
}

describe('GetBuild', function () {
  before(function () {
    this.timeout(15000);
    exec('make mongo-restore', {cwd: resolve(__dirname, '../../../../')});
  });

  it('retrieves existing build', function () {
    const response = chakram.get(getUrl('urn:gh:knplabs/gaufrette:1'));

    expect(response).to.have.status(200);
    expect(response).to.have.json({
      buildId: "1",
      projectUrn: "urn:gh:knplabs/gaufrette",
      branch: "master",
      repoUrl: "https://github.com/knplabs/gaufrette",
      state: "running",
      stages: [
        {
          "state": "running",
          "runners": {
            "php-cs-fixer": "running",
            "phpqa": "succeeded"
          }
        }
      ]
    });

    return chakram.wait();
  });

  it('returns a 404 if the build is not found', function () {
    const response = chakram.get(getUrl('urn:gh:knplabs/gaufrette:1234'));

    expect(response).to.have.status(404);
    expect(response).to.have.json({error: 'BuildNotFound'});

    return chakram.wait();
  });
});
