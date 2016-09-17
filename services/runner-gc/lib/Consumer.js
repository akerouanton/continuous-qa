const amqp = require('amqp');
const logger = require('tracer').colorConsole();

export default class {
  constructor(emitter, config) {
    this._emitter = emitter;
    this._config = config;
  }

  connect() {
    this._connection = amqp.createConnection({
      host: this._config.host,
      port: this._config.port
    });

    this._connection.on('ready', this._onConnectionReady.bind(this));
    this._connection.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
  }

  _onConnectionReady() {
    logger.info('AMQP connection ready.');

    this._connection.queue('runner_gc', { durable: true }, (queue) => {
      queue.bind(this._config.exchange, 'container.die');
      logger.info('Queue declared, binding done.');

      queue.subscribe({ ack: true }, (message) => {
        logger.info('New AMQP message received.');
        logger.debug(message);

        this._emitter.emit('runnerDie', message);
      });

      this._emitter.on('runnerCleaned', () => {
        logger.info('Runner cleaned.');

        queue.shift(false, false);
      });
      this._emitter.on('error', () => {
        logger.warn('An error happened while processing a message.', arguments);

        queue.shift(true, false);
      });
    });
  }
}
