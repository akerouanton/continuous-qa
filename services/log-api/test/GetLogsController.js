const sinon = require('sinon');
const Promise = require('promise');

import GetLogsController from '../lib/controller/GetLogs';
import LogRepository from '../lib/service/LogRepository';

describe('GetLogsController', function () {
  let repository, controller, mock;
  let req = {}, res = {};
  let next = (err) => {
    throw new Error(err);
  };

  before(function () {
    repository = new LogRepository();
    mock = sinon.mock(repository);

    controller = new GetLogsController(repository);
  });

  it('retrieves logs for a specific identifier', function () {
    mock.expects("getLogs").withArgs("urn:gh:knplabs/gaufrette:1:php-cs-fixer").returns(Promise.resolve([]));
    req.params = {analysisUrn: "urn:gh:knplabs/gaufrette:1:php-cs-fixer"};
    res.status = sinon.stub().withArgs(200).returns(res);
    res.json = sinon.stub().withArgs([]);

    return controller.handleRequest(req, res, next);
  });

  it('passes the error to the next callback when the repository fail', function (done) {
    mock.expects("getLogs").withArgs("urn:gh:knplabs/gaufrette:1:php-cs-fixer").returns(Promise.reject('error message'));
    req.params = {analysisUrn: "urn:gh:knplabs/gaufrette:1:php-cs-fixer"};
    next = (err) => {
      done();
    };

    controller.handleRequest(req, res, next);
  });
});
