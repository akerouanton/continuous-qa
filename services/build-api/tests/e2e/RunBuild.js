const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');
const exec = require('child_process').execSync;
const resolve = require('path').resolve;

function getUrl(buildUrn) {
  return `http://localhost:${config.httpPort}/build/${encodeURIComponent(buildUrn)}/run`;
}

describe('RunBuild', function () {
  let buildUrn = 'urn:gh:knplabs/gaufrette:2';

  before(function () {
    this.timeout(15000);

    exec('make mongo-restore', {cwd: resolve(__dirname, '../../../../')});
  });

  it('starts build run', function () {
    const response = chakram.post(getUrl(buildUrn), {stages: [['php-cs-fixer', 'phpqa'], ['deploy']]})

    expect(response).to.have.status(200);
    expect(response).to.have.json({
      buildId: "2",
      projectUrn: "urn:gh:knplabs/gaufrette",
      branch: "master",
      repoUrl: "https://github.com/knplabs/gaufrette",
      state: "running",
      stages: [
        {
          "state": "running",
          "runners": {
            "php-cs-fixer": "queued",
            "phpqa": "queued"
          }
        },
        {
          "state": "pending",
          "runners": {
            "deploy": "pending"
          }
        }
      ]
    });

    return chakram.wait();
  });

  it('returns 400 InvalidStages if stages are not provided', function () {
    const response = chakram.post(getUrl(buildUrn));

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'InvalidStages'});

    return chakram.wait();
  });

  it('returns 400 InvalidStages if provided stages are not list of runners', function () {
    const response = chakram.post(getUrl(buildUrn), {stages: ['php-cs-fixer', 'phpqa']});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'InvalidStages'});

    return chakram.wait();
  });

  it('returns 400 InvalidState if the build has already started', function () {
    buildUrn = 'urn:gh:knplabs/gaufrette:1';
    const response = chakram.post(getUrl(buildUrn), {stages: [['php-cs-fixer']]});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'InvalidState'});

    return chakram.wait();
  });

  it('returns 404 BuildNotFound if the build does not exist', function () {
    buildUrn = 'urn:gh:knplabs/gaufrette:123';
    const response = chakram.post(getUrl(buildUrn), {stages: [['php-cs-fixer']]});

    expect(response).to.have.status(404);
    expect(response).to.have.json({error: 'BuildNotFound'});

    return chakram.wait();
  });
});
