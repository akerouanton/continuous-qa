const chakram = require('chakram');
const expect = chakram.expect;
const config = require('config');
const exec = require('child_process').execSync;
const resolve = require('path').resolve;

function getUrl(projectUrn) {
  return `http://localhost:${config.httpPort}/builds/${encodeURIComponent(projectUrn)}`;
}

describe('GetBuildHistory', function () {
  before(function () {
    this.timeout(15000);
    exec('make mongo-restore', {cwd: resolve(__dirname, '../../../../')});
  });

  it('retrieves all builds belonging to a specific project, sorted by date', function () {
    const response = chakram.get(getUrl('urn:gh:knplabs/gaufrette'));

    expect(response).to.have.status(200);
    expect(response).to.have.json([
      {
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
      },
      {
        buildId: "2",
        projectUrn: "urn:gh:knplabs/gaufrette",
        branch: "master",
        repoUrl: "https://github.com/knplabs/gaufrette",
        state: "created",
        stages: []
      },
      {
        buildId: "3",
        projectUrn: "urn:gh:knplabs/gaufrette",
        branch: "master",
        repoUrl: "https://github.com/knplabs/gaufrette",
        state: "running",
        stages: [
          {
            "state": "running",
            "runners": {
              "build": "running"
            }
          },
          {
            "state": "pending",
            "runners": {
              "php-cs-fixer": "pending",
              "phpqa": "pending",
              "phpspec": "pending",
              "behat": "pending"
            }
          },
          {
            "state": "pending",
            "runners": {
              "deploy": "pending"
            }
          }
        ]
      },
      {
        buildId: "4",
        projectUrn: "urn:gh:knplabs/gaufrette",
        branch: "master",
        repoUrl: "https://github.com/knplabs/gaufrette",
        state: "running",
        stages: [
          {
            "state": "running",
            "runners": {
              "deploy": "pending"
            }
          }
        ]
      }
    ]);

    return chakram.wait();
  });
});
