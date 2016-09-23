const logger = require('winston');
const crypto = require('crypto');

export default class Controller {
  constructor(emitter, secret) {
    this._emitter = emitter;
    this._secret = secret;
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
    const digest = crypto
      .createHmac(algo, this._secret)
      .update(JSON.stringify(req.body))
      .digest('hex')
    ;

    // @TODO: Use crypto.timingSafeEqual when available
    if (digest !== signature) {
      res.status(400).json({error: 'InvalidSignature'});
      return;
    }

    next();
  }
}
