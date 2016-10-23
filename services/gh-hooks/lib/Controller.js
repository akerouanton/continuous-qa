const logger = require('winston');

export default class Controller {
  constructor(emitter, signatureChecker) {
    this._emitter = emitter;
    this._signatureChecker = signatureChecker;
  }

  handleRequest(req, res) {
    const event = req.header('X-Github-Event');
    if (!event) {
      res.status(400).json({error: 'MissingEventType'});
    }

    logger.info(`Webhook "${event}" triggered.`);
    this._emitter.emit(event, req.body);

    res.sendStatus(200);
  }

  checkRequestSignature(req, res, next) {
    const signatureHeader = req.header('X-Hub-Signature');
    if (!signatureHeader) {
      res.status(400).json({error: 'MissingSignature'});
      return;
    }

    const [algo, signature] = signatureHeader.split('=', 2);

    if (!this._signatureChecker.checkSignature(algo, signature)) {
      res.status(400).json({error: 'InvalidSignature'});
      return;
    }

    next();
  }
}
