const logger = require('tracer').colorConsole();
const EventEmitter = require('events');

import DockerListener from './DockerListener';
import AmqpPublisher from './AmqpPublisher';

export default class {
  constructor(config) {
    this._config = config;
    this._emitter = new EventEmitter();

    const listener = new DockerListener(this._emitter, this._config.docker);
    const publisher = new AmqpPublisher(this._emitter, this._config.amqp);

    this._emitter.on('amqp_ready', () => {
      logger.info('Start listening docker events.');

      listener.listenEvents();
    });
    this._emitter.on('eventReceived', (event) => {
      logger.info('New event "' + event.Type + ' ' + event.Action + '" for "' + event.Actor.ID + '" received.');

      publisher.handleEvent(event);
    });
    this._emitter.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
    this._emitter.on('end', () => {
      logger.info('Docker stream ended.');
      process.exit(0);
    });

    publisher.connect();
  }
}
