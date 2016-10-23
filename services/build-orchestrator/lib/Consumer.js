const amqp = require('amqp');
const logger = require('tracer').colorConsole();
const config = require('config');

export default class {
  constructor(emitter) {
    this._emitter = emitter;
  }

  connect() {
    this._connection = amqp.createConnection(config.amqp);

    this._connection.on('ready', this._onConnectionReady.bind(this));
    this._connection.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
  }

  _onConnectionReady() {
    logger.info('AMQP connection ready.');

    this._subscribeTo('start_build', 'build.created');
    this._subscribeTo('start_runner', 'runner.queued');
    this._subscribeTo('runner_gc', 'runner.die');
    this._subscribeTo('drop_runner', 'runner.finished');
  }

  _subscribeTo(queueName, routingKey) {
    this._connection.queue(queueName, { durable: true, autoDelete: false }, (queue) => {
      queue.bind(config.amqp.exchange, routingKey);
      logger.info(`Queue "${queueName}" declared, binding done.`);

      queue.subscribe({ ack: true }, (message) => {
        logger.debug(`New message on "${queueName}" queue.`);

        this
          ._emitter
          .emit(routingKey, message)
          .then(
            () => queue.shift(false, false),
            () => queue.shift(true, false)
          );
      });
    });
  }
}
