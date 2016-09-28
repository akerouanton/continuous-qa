const config = require('config');
const chakram = require('chakram');
const expect = chakram.expect;
const exec = require('child_process').execSync;

import Runner from '../../lib/service/Runner';

function postUrl(buildUrn, analyzer) {
  const encodedUrn = encodeURIComponent(buildUrn);
  const encodedAnalyzer = encodeURIComponent(analyzer);

  return `http://localhost:${config.http_port}/runner/${encodedUrn}/${encodedAnalyzer}/start`;
}

function dropContainer(containerName) {
  exec(`docker rm -vf ${containerName} 1>/dev/null 2>&1 || true`);
}

describe('StartRunner', function () {
  const buildUrn = 'urn:gh:knplabs/gaufrette:1';
  const analyzer = 'test-true';
  const containerName = Runner.normalizeRunnerName(buildUrn, analyzer);

  beforeEach(dropContainer.bind(null, containerName));
  after(dropContainer.bind(null, containerName));

  it('starts a new runner for a given build and analyzer', function () {
    const data = {repoUrl: 'https://github.com/knplabs/gaufrette', reference: 'master'};
    const response = chakram.post(postUrl(buildUrn, analyzer), data);

    return expect(response).to.have.status(200);
  });

  it('denies request when build urn is not valid', function () {
    const response = chakram.post(postUrl('urn:gh:blabla', analyzer));

    return expect(response).to.have.status(400).json({error: 'UrnNotValid'});
  });

  it('denies request when repository url is missing', function () {
    const response = chakram.post(postUrl(buildUrn, analyzer));

    return expect(response).to.have.status(400).json({error: 'MissingRepoUrl'});
  });

  it('denies request when reference is missing', function () {
    const response = chakram.post(postUrl(buildUrn, analyzer), {repoUrl: 'https://github.com/knplabs/gaufrette'});

    return expect(response).to.have.status(400).json({error: 'MissingReference'});
  });

  it('denies request when analyzer not supported', function () {
    const data = {repoUrl: 'https://github.com/knplabs/gaufrette', reference: 'master'};
    const response = chakram.post(postUrl(buildUrn, 'not-supported'), data);

    return expect(response).to.have.status(404).json({error: 'AnalyzerNotSupported'});
  });

  it('denies request when runner already exists', function () {
    exec(`docker run --name ${containerName} debian /bin/true`);
    const data = {repoUrl: 'https://github.com/knplabs/gaufrette', reference: 'master'};
    const response = chakram.post(postUrl(buildUrn, analyzer), data);

    return expect(response).to.have.status(409).json({error: 'RunnerAlreadyCreated'});
  });
});
