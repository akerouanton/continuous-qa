const express = require('express');
const mongoose = require('mongoose');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const config = require('config');
const morgan = require('morgan');
const amqp = require('amqp');

import router from './router';
import errorHandler from './errorHandler';

export default class App {
  constructor() {
    this._express = express();
    const amqpConnection = amqp.createConnection(config.amqp);

    mongoose.Promise = global.Promise;
    mongoose.connect(`${config.mongo_uri}`);

    this._express.disable('x-powered-by');
    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({extended: true}));

    amqpConnection.on('ready', () => {
      const exchange = amqpConnection.exchange('amq.topic', {type: 'topic'});

      this._finishBoot(exchange);
    });
    amqpConnection.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
  }

  _finishBoot(exchange) {
    this._express.use(router(exchange));
    this._express.use(errorHandler());

    this._express.listen(config.http_port, () => {
      logger.info(`Start listening on port ${config.http_port}.`);
    });
  }
}
