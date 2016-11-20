const express = require('express');
const morgan = require('morgan');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const amqp = require('amqp');
const config = require('config');

import router from './router';
import errorHandler from './errorHandler';
import EventEmitter from './service/PromisifiedEventEmitter';
import * as PullRequestUpdated from './listener/PullRequestUpdated';
import * as RepositoryAdded from './listener/RepositoryAdded';

export default class App {
  constructor() {
    this._express = express();
    this._amqpConnection = amqp.createConnection(config.amqp);

    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({extended: false}));
    this._express.use(router());
    this._express.use(errorHandler());

    this._amqpConnection.on('ready', () => {
      this._finishBoot();
    });
    this._amqpConnection.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
  }

  _finishBoot() {
    this._createQueues();

    EventEmitter.on('pull_request', PullRequestUpdated.handle);
    EventEmitter.on('repository.added', RepositoryAdded.handle);

    this._express.listen(config.httpPort, () => {
      logger.info(`Server started on port ${config.httpPort}.`);
    });
  }

  _createQueues() {
    this._amqpConnection.queue('register_hooks', {durable: true, autoDelete: false}, (queue) => {
      queue.bind('amq.topic', 'repository.added');
      logger.info('Queue "register_hooks" binded to "repository.added".');

      queue.subscribe({ack: true}, (message, headers) => {
        logger.debug('New message on "register_hooks" queue.');

        EventEmitter
          .emit('repository.added', message, headers)
          .then(() => queue.shift(false, false), (err) => {
            logger.error(err);
            queue.shift(true, false);
          })
        ;
      });
    });
  }
}
