const config = require('config');
const chai = require('chai');
const sinon = require('sinon');
chai.should();
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

import Runner from '../../lib/service/Runner';
import {RunnerError, RunnerAlreadyExistsError, RunnerNotFoundError, AnalyzerNotSupportedError} from '../../lib/service/RunnerError';

describe('Runner', function () {

  const docker = {}, buildUrn = "urn:gh:knplabs/gaufrette:1", analyzer = "php-cs-fixer";
  let runner;

  beforeEach(function () {
    runner = new Runner(docker, {label_prefix: "com.continuousqa"});
  });

  it('adds label prefix to normalized labels', function () {
    runner.normalizeLabels({
      runner: true,
      analyzer: analyzer
    }).should.be.deep.equal({
      "com.continuousqa.runner": true,
      "com.continuousqa.analyzer": analyzer
    });
  });

  it('starts a new runner', function (done) {
    const container = { start: sinon.stub() };
    docker.createContainer = sinon.stub().returns(Promise.resolve(container));

    const promise = runner.startRunner(buildUrn, analyzer, "https://github.com/knplabs/gaufrette", "master", "/tmp/test");
    promise.should.be.fulfilled.then(function () {
      docker.createContainer.should.have.been.calledWith({
        Env: ["REPO_URL=https://github.com/knplabs/gaufrette", "GIT_REF=master"],
        HostConfig: {
          Binds: ["/tmp/test:/artifacts/", "/var/run/docker.sock:/var/run/docker.sock"]
        },
        Image: "continuousqa/php-cs-fixer",
        Labels: {
          "com.continuousqa.analyzer": analyzer,
          "com.continuousqa.buildUrn": buildUrn,
          "com.continuousqa.mountPoint": "/tmp/test",
          "com.continuousqa.reference": "master",
          "com.continuousqa.repoUrl": "https://github.com/knplabs/gaufrette",
          "com.continuousqa.runnerName": "b1de6f9705948f9697209b681ab34b9c4b99ee47",
          "com.continuousqa.runner": "true"
        },
        name: "b1de6f9705948f9697209b681ab34b9c4b99ee47"
      });
    }).should.notify(done);
  });

  it('throws an AnalyzerNotSupportedError if the image is not found', function () {
    docker.createContainer = sinon.stub().returns(Promise.reject({statusCode: 404}));

    return runner.startRunner(buildUrn, analyzer).should.be.rejectedWith(AnalyzerNotSupportedError);
  });

  it('throws a RunnerAlreadyExistsError if the container name is already in use', function () {
    docker.createContainer = sinon.stub().returns(Promise.reject({statusCode: 409}));

    return runner.startRunner(buildUrn, analyzer).should.be.rejectedWith(RunnerAlreadyExistsError);
  });

  it('throws a RunnerError if any other error happen while starting a runner', function () {
    docker.createContainer = sinon.stub().returns(Promise.reject({statusCode: 400}));

    return runner.startRunner(buildUrn, analyzer).should.be.rejectedWith(RunnerError);
  });

  it('stops runner', function (done) {
    const container = { stop: sinon.stub().returns(Promise.resolve({ statusCode: 204 })) };
    docker.getContainer = sinon.stub().returns(container);

    const promise = runner.stopRunner(buildUrn, analyzer);
    promise.should.be.fulfilled.then(function () {
      docker.getContainer.should.have.been.calledWith("b1de6f9705948f9697209b681ab34b9c4b99ee47");
      container.stop.should.have.been.calledWith({t: 1});
    }).should.notify(done);
  });

  it('does not complain if it tries to stop a runner already stopped', function () {
    const container = { stop: sinon.stub().returns(Promise.reject({ statusCode: 304 })) };
    docker.getContainer = sinon.stub().returns(container);

    return runner.stopRunner(buildUrn, analyzer).should.be.fulfilled;
  });

  it('throws a RunnerNotFoundError if the runner does not exists at stop time', function () {
    const container = { stop: sinon.stub().returns(Promise.reject({ statusCode: 404 })) };
    docker.getContainer = sinon.stub().returns(container);

    return runner.stopRunner(buildUrn, analyzer).should.be.rejectedWith(RunnerNotFoundError);
  });

  it('throws a RunnerError if any other error happen while stopping a runner', function () {
    const container = { stop: sinon.stub().returns(Promise.reject({ statusCode: 500 })) };
    docker.getContainer = sinon.stub().returns(container);

    return runner.stopRunner(buildUrn, analyzer).should.be.rejectedWith(RunnerError);
  });

  it('drops runner', function (done) {
    const container = {
      stop: sinon.stub().returns(Promise.reject({ statusCode: 304 })),
      remove: sinon.stub().returns(Promise.resolve({ statusCode: 204 }))
    };
    docker.getContainer = sinon.stub().returns(container);

    const promise = runner.dropRunner(buildUrn, analyzer);
    promise.should.be.fulfilled.then(function () {
      docker.getContainer.should.have.been.calledWith("b1de6f9705948f9697209b681ab34b9c4b99ee47");
      container.remove.should.have.been.called;
      container.stop.should.have.been.called;
    }).should.notify(done);
  });

  it('throws a RunnerError if any error happen while dropping a runner', function () {
    const container = {
      stop: sinon.stub().returns(Promise.reject({ statusCode: 304 })),
      remove: sinon.stub().returns(Promise.reject({ statusCode: 500 }))
    };
    docker.getContainer = sinon.stub().returns(container);

    return runner.dropRunner(buildUrn, analyzer).should.be.rejectedWith(RunnerError)
  });
});
