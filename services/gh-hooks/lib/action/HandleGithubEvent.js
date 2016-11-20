const logger = require('tracer').colorConsole();

import {HttpClientError} from '../errors';
import * as SignatureChecker from '../service/SignatureChecker';
import EventEmitter from '../service/PromisifiedEventEmitter';

export function handleRequest(req, res, next) {
  const event = req.header('X-Github-Event');

  logger.info(`Webhook "${event}" triggered.`);
  EventEmitter
    .emit(event, req.body)
    .then(() => res.sendStatus(200))
    .catch((err) => next(err))
  ;
}

export function validateRequest(req, res, next) {
  const signatureHeader = req.header('X-Hub-Signature');
  if (!signatureHeader) {
    return next(new HttpClientError('MissingSignature'));
  }

  const [algo, signature] = signatureHeader.split('=', 2);
  if (!SignatureChecker.checkSignature(algo, signature, req.body)) {
    return next(new HttpClientError('InvalidSignature'));
  }

  const event = req.header('X-Github-Event');
  if (!event) {
    return next(new HttpClientError('MissingEventType'));
  }

  next();
}
