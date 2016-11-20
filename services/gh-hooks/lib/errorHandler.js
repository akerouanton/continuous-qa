const logger = require('tracer').colorConsole();

import {HttpClientError} from './errors';

export default function errorHandler() {
  return (err, req, res, next) => {
    if (err instanceof HttpClientError) {
      return res.status(err.statusCode).json({error: err.reason});
    }

    logger.error(err);
    return res.status(500).end();
  }
}
