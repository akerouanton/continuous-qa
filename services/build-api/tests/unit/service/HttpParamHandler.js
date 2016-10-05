const chai = require('chai');
const sinon = require('sinon');
chai.should();
chai.use(require('sinon-chai'));

import HttpParamHandler from '../../../lib/service/HttpParamHandler';

describe('HttpParamHandler', function () {
  let req, res, next;

  beforeEach(function () {
    req = {params: {}};
    res = {
      status: sinon.stub().returns(res),
      json: sinon.stub()
    };
    next = sinon.spy();
  });

  describe('projectUrn handler', function () {
    it('accepts valid projectUrn', function () {
      HttpParamHandler.projectUrn(req, res, next, 'urn:gh:knplabs/gaufrette');

      next.should.have.been.called;
      res.status.should.not.have.been.called;
    });

    it('returns a 400 for invalid projectUrn', function () {
      HttpParamHandler.projectUrn(req, res, next, 'urn:gh:knplabs');

      next.should.not.have.been.called;
      res.status.should.have.been.calledWith(400);
    });
  });

  describe('buildUrn handler', function () {
    it('extracts projectUrn and buildId from valid buildUrn', function () {
      HttpParamHandler.buildUrn(req, res, next, 'urn:gh:knplabs/gaufrette:15');

      next.should.have.been.called;
      res.status.should.not.have.been.called;
      req.params.projectUrn.should.equal('urn:gh:knplabs/gaufrette');
      req.params.buildId.should.equal(15);
    });

    it('returns a 400 for invalid buildUrn', function () {
      HttpParamHandler. buildUrn(req, res, next, 'urn:gh:knplabs/15');

      next.should.not.have.been.called;
      res.status.should.have.been.calledWith(400);
      req.params.should.be.empty;
    });
  });

  describe('stage handler', function () {
    it('accepts only numeric chars', function () {
      HttpParamHandler.stage(req, res, next, '15');

      next.should.have.been.called;
      res.status.should.not.have.been.called;
    });

    it('returns a 400 for alphabetic chars', function () {
      HttpParamHandler.stage(req, res, next, 'aze');

      next.should.not.have.been.called;
      res.status.should.have.been.calledWith(400);
    });

    it('returns a 400 for 0', function () {
      HttpParamHandler.stage(req, res, next, '0');

      next.should.not.have.been.called;
      res.status.should.have.been.calledWith(400);
    });
  });

  describe('runner handler', function () {
    it('accepts valid runner name', function () {
      HttpParamHandler.runner(req, res, next, 'test_runner');

      next.should.have.been.called;
      res.status.should.not.have.been.called;
    });

    it('returns a 400 for invalid runner name', function () {
      HttpParamHandler.runner(req, res, next, 'bad/runner/name');

      next.should.not.have.been.called;
      res.status.should.have.been.calledWith(400);
    });
  });
});
