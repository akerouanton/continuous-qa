const logger = require('tracer').colorConsole();

export default class HttpParamHandler {
  static projectUrn(req, res, next, urn) {
    if (/^urn:gh:[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+$/.test(urn)) {
      return next();
    }

    res.status(400).json({error: 'UrnNotValid'});
  }

  static buildUrn(req, res, next, urn) {
    const matches = /^(urn:gh:[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+):(\d+)$/.exec(urn);

    if (matches !== null) {
      req.params.projectUrn = matches[1];
      req.params.buildId = parseInt(matches[2]);
      return next();
    }

    res.status(400).json({error: 'UrnNotValid'});
  }

  static stage(req, res, next, branch) {
    if (/^[0-9]+$/.test(branch)) {
      return next();
    }

    res.status(400).json({error: 'InvalidStage'});
  }

  static runner(req, res, next, branch) {
    if (/^[a-zA-Z_\-]+$/.test(branch)) {
      return next();
    }

    res.status(400).json({error: 'InvalidRunner'});
  }
}
