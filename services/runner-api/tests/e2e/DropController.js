const config = require('config');
const chakram = require('chakram');
const expect = chakram.expect;
const exec = require('child_process').execSync;

import Runner from '../../lib/service/Runner';

function postUrl(buildUrn, analyzer) {
  const encodedUrn = encodeURIComponent(buildUrn);
  const encodedAnalyzer = encodeURIComponent(analyzer);

  return `http://localhost:${config.http_port}/runner/${encodedUrn}/${encodedAnalyzer}/drop`;
}

function dropContainer(containerName) {
  exec(`docker rm -vf ${containerName} 1>/dev/null 2>&1 || true`);
}

describe('DropRunner', function () {
  const buildUrn = 'urn:gh:knplabs/gaufrette:1';
  const analyzer = 'test-true';
  let containerName = Runner.normalizeRunnerName(buildUrn, analyzer);

  before(dropContainer.bind(null, containerName));
  after(dropContainer.bind(null, containerName));

  it('drops the runner for a given buildUrn and analyzer', function () {
    exec(`docker run --name ${containerName} debian /bin/true 1>/dev/null 2>&1 || true`);
    const response = chakram.post(postUrl(buildUrn, analyzer));

    return expect(response).to.have.status(200);
  });

  it('denies request when build urn is not valid', function () {
    const response = chakram.post(postUrl('urn:gh:blabla', analyzer));

    return expect(response).to.have.status(400).json({error: 'UrnNotValid'});
  });

  it('denies request if the runner does not exists', function () {
    const response = chakram.post(postUrl(buildUrn, 'not-exists'));

    return expect(response).to.have.status(404).json({error: 'RunnerNotExists'});
  });

  this.timeout(3000);
});
