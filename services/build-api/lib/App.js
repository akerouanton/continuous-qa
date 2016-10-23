const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const amqp = require('amqp');
const _ = require('underscore');

import EventPublisher from './service/EventPublisher';
import router from './Router';
import listeners from './listener/index';

export default class App {
  constructor(config) {
    this._config = config;
    this._express = express();
    this._amqpConnection = amqp.createConnection(config.amqp);

    this._boot();
  }

  _boot() {
    mongoose.Promise = global.Promise;
    mongoose.connect(`${this._config.mongo.uri}/${this._config.mongo.db}`);

    this._amqpConnection.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
    this._amqpConnection.on('ready', () => {
      logger.info('AMQP connection ready.');

      const exchange = this._amqpConnection.exchange('amq.topic', {type: 'topic'});
      this._publisher = new EventPublisher(exchange);

      this._finishBoot();
    });

    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: true }));
    this._express.use(router());
    this._express.use((err, req, res, next) => {
      logger.error(err);
      res.sendStatus(500).end();
    });
  }

  _finishBoot() {
    for (let listener of _.values(listeners)) {
      listener.bind({publisher: this._publisher});
    }
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Start listening on port ${this._config.httpPort}.`);
    })
  }
}
