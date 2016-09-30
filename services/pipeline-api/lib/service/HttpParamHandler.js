export default class HttpParamHandler {
  static pipelineUrn(req, res, next, urn) {
    const matches = /^(urn:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+):([a-zA-Z_\-\/\*]+)$/.exec(urn);
    if (matches === null) {
      return res.status(400).json({error: 'UrnNotValid'});
    }

    req.params.projectUrn = matches[1];
    req.params.pattern = matches[2];
    next();
  }

  static projectUrn(req, res, next, urn) {
    if (/^urn:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/.test(urn)) {
      return next();
    }

    res.status(400).json({error: 'UrnNotValid'});
  }

  static branch(req, res, next, branch) {
    if (/^[a-zA-Z_\-\/\*]+$/.test(branch)) {
      return next();
    }

    res.status(400).json({error: 'InvalidBranch'});
  }
}
