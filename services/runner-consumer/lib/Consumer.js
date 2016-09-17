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

    this._connection.queue('start_runner', { durable: true, autoDelete: false }, (queue) => {
      queue.bind(this._config.exchange, 'build.created');
      logger.info('Queue declared, binding done.');

      queue.subscribe({ ack: true }, (message, headers, deliveryInfo, messageObject) => {
        logger.info('New message received.');
        this._emitter.emit('buildCreated', message);
      });

      this._emitter.on('runnersCreated', () => {
        queue.shift(false, false);
      });
      this._emitter.on('error', (err) => {
        logger.warn(err);
        queue.shift(true, false);
      });
    });
  }
}
