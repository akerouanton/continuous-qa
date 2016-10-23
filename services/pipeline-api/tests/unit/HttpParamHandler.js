const chai = require('chai');
const sinon = require('sinon');
chai.should();
chai.use(require('sinon-chai'));

import HttpParamHandler from '../../lib/service/HttpParamHandler';

describe('HttpParamHandler', function () {
  let next, req, res;

  beforeEach(function () {
    req = {params: []};
    res = {
      status: sinon.stub().returns(res),
      json: sinon.stub().returns(res)
    };
    next = sinon.spy(function() {});
  });

  describe('pipelineUrn handler', function () {
    it('sets the projectUrn and the branch pattern request parameters based on pipelineUrn', function () {
      HttpParamHandler.pipelineUrn(req, res, next, 'urn:gh:knplabs/gaufrette:feature-6_0/*');

      req.params.projectUrn.should.equal('urn:gh:knplabs/gaufrette');
      req.params.pattern.should.equal('feature-6_0/*');
      next.should.have.been.called;
    });

    it('returns a 400 for a bad projectUrn', function () {
      HttpParamHandler.pipelineUrn(req, res, next, 'urn:gh:knplabs:feature/*');

      res.status.should.have.been.calledWith(400);
      req.params.should.be.empty;
      next.should.not.have.been.called;
    });

    it('returns a 400 for an empty branch pattern', function () {
      HttpParamHandler.pipelineUrn(req, res, next, 'urn:gh:knplabs/gaufrette:');

      res.status.should.have.been.calledWith(400);
      req.params.should.be.empty;
      next.should.not.have.been.called;
    });
  });

  describe('projectUrn handler', function () {
    it('accepts valid projectUrn', function () {
      HttpParamHandler.projectUrn(req, res, next, 'urn:gh:knplabs/gaufrette');

      next.should.have.been.called;
      res.status.should.not.have.been.called;
    });

    it('returns a 400 for invalid projectUrn', function () {
      HttpParamHandler.projectUrn(req, res, next, 'urn:gh:knplabs');

      res.status.should.have.been.calledWith(400);
      next.should.not.have.been.called;
    });
  });

  describe('branch handler', function () {
    it('accepts branch name with alphanumeric characters', function () {
      HttpParamHandler.branch(req, res, next, 'feature-6_0/fix');

      next.should.have.been.called;
      res.status.should.not.have.been.called;
    });

    it('returns a 400 for invalid branch name', function () {
      HttpParamHandler.branch(req, res, next, '&');

      next.should.not.have.been.called;
      res.status.should.have.been.calledWith(400);
    });
  });
});
