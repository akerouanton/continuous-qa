const logger = require('tracer').colorConsole();

import {HttpClientError, HttpServerError} from './errors';

export default function errorHandler() {
  return (err, req, res, next) => {
    if (err instanceof HttpClientError) {
      return res.status(err.statusCode).json({error: err.reason});
    } else if (err instanceof HttpServerError) {
      logger.error(err.reason);
      return res.status(err.statusCode).end();
    } else if (err.name === 'UnauthorizedError') {
      return res.sendStatus(401);
    }

    logger.error(err, err.stack);
    return res.status(500).end();
  }
}
