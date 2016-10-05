const chakram = require('chakram');
const expect = chakram.expect;
const exec = require('child_process').execSync;
const resolve = require('path').resolve;
const config = require('config');

function getUrl(projectUrn) {
  return `http://localhost:${config.httpPort}/builds/${encodeURIComponent(projectUrn)}/new`;
}

describe('CreateBuild', function () {
  before(function () {
    this.timeout(15000);
    exec('make mongo-restore', {cwd: resolve(__dirname, '../../../..')});
  });

  it('creates a new build', function () {
    const response = chakram.post(getUrl('urn:gh:knplabs/gaufrette'), {
      branch: 'master',
      repoUrl: 'https://github.com/knplabs/gaufrette'
    });

    expect(response).to.have.status(200);
    expect(response).to.have.header('Location');
    expect(response).to.have.json({
      "buildId": "3",
      "projectUrn": "urn:gh:knplabs/gaufrette",
      "branch": "master",
      "repoUrl": "https://github.com/knplabs/gaufrette",
      "stages": [],
      "state": "created"
    });

    return chakram.wait();
  });

  it('returns a 400 with error MissingRepoUrl when repoUrl is not sent', function () {
    const response = chakram.post(getUrl('urn:gh:knplabs/gaufrette'), {branch: 'master'});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'MissingRepoUrl'});

    return chakram.wait();
  });

  it('returns a 400 with error MissingBranch when branch is not sent', function () {
    const response = chakram.post(getUrl('urn:gh:knplabs/gaufrette'), {repoUrl: 'https://github.com/knplabs/gaufrette'});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'MissingBranch'});

    return chakram.wait();
  });

  it('returns a 400 with error UrnNotValid when the repoUrn is not valid', function () {
    const response = chakram.post(getUrl('urn:gh:knplabs'));

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'UrnNotValid'});

    return chakram.wait();
  })
});
