const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');
const exec = require('child_process').execSync;
const resolve = require('path').resolve;

function getUrl(buildUrn, stage, runner) {
  return `http://localhost:${config.httpPort}/build/${encodeURIComponent(buildUrn)}/${stage}/${runner}`;
}

describe('UpdateRunnerState', function () {
  before(function () {
    this.timeout(15000);

    exec('make mongo-restore', {cwd: resolve(__dirname, '../../../../')});
  });

  it('updates state of runner, stage & build', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:1', 1, 'php-cs-fixer');
    const response = chakram.patch(url, {state: 'failed'});

    expect(response).to.have.status(200);
    expect(response).to.have.json({
      buildId: "1",
      projectUrn: "urn:gh:knplabs/gaufrette",
      branch: "master",
      repoUrl: "https://github.com/knplabs/gaufrette",
      state: "failed",
      stages: [
        {
          "state": "failed",
          "runners": {
            "php-cs-fixer": "failed",
            "phpqa": "succeeded"
          }
        }
      ]
    });

    return chakram.wait();
  });

  it('ends running stage and starts next one', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:3', 1, 'build');
    const response = chakram.patch(url, {state: 'succeeded'});

    expect(response).to.have.status(200);
    expect(response).to.have.json({
      buildId: "3",
      projectUrn: "urn:gh:knplabs/gaufrette",
      branch: "master",
      repoUrl: "https://github.com/knplabs/gaufrette",
      state: "running",
      stages: [
        {
          "state": "succeeded",
          "runners": {
            "build": "succeeded"
          }
        },
        {
          "state": "running",
          "runners": {
            "php-cs-fixer": "queued",
            "phpqa": "queued",
            "phpspec": "queued",
            "behat": "queued"
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

  it('returns 400 InvalidState if the state is not valid', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:3',  2, 'php-cs-fixer');
    const response = chakram.patch(url, {state: 'unknown'});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'InvalidState'});

    return chakram.wait();
  });

  it('returns 404 BuildNotFound if build does not exist', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:12345', 1, 'php-cs-fixer');
    const response = chakram.patch(url, {state: 'failed'});

    expect(response).to.have.status(404);
    expect(response).to.have.json({error: 'BuildNotFound'});

    return chakram.wait();
  });

  it('returns 404 StageNotFound if stage does not exist', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:3', 10, 'php-cs-fixer');
    const response = chakram.patch(url, {state: 'failed'});

    expect(response).to.have.status(404);
    expect(response).to.have.json({error: 'StageNotFound'});

    return chakram.wait();
  });

  it('returns 404 RunnerNotFound if runner does not exist', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:3', 2, 'unknown');
    const response = chakram.patch(url, {state: 'failed'});

    expect(response).to.have.status(404);
    expect(response).to.have.json({error: 'RunnerNotFound'});

    return chakram.wait();
  });

  it('returns 400 BuildNotRunning if the build is not started yet', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:2', 1, 'php-cs-fixer');
    const response = chakram.patch(url, {state: 'running'});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'BuildNotRunning'});

    return chakram.wait();
  });

  it('returns 400 StageNotRunning if the stage is not running yet', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:3', 3, 'deploy');
    const response = chakram.patch(url, {state: 'running'});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'StageNotRunning'});

    return chakram.wait();
  });

  it('returns 400 TransitionDisallowed if the transition from the stored to the submitted state is not possible', function () {
    const url = getUrl('urn:gh:knplabs/gaufrette:4', 1, 'deploy');
    const response = chakram.patch(url, {state: 'failed'});

    expect(response).to.have.status(400);
    expect(response).to.have.json({error: 'TransitionDisallowed'});

    return chakram.wait();
  });
});
