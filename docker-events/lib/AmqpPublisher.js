const amqp = require('amqp');
const logger = require('tracer').colorConsole();

export default class AmqpPublisher {
  constructor(emitter, config) {
    this._emitter = emitter;
    this._config = config;
  }

  connect() {
    this._connection = amqp.createConnection({
      host: this._config.host,
      port: this._config.port
    });

    this._connection.on('ready', this.onConnectionReady.bind(this));
    this._connection.on('error', (err) => {
      this._emitter.emit('error', err);
    });
  }

  onConnectionReady() {
    logger.info('AMQP connection ready.');

    this._exchange = this
      ._connection
      .exchange(this._config.exchange)
      .on('open', () => {
        logger.info('Exchange "' + this._config.exchange + '" opened.');

        this._emitter.emit('amqp_ready');
      })
    ;
  }

  handleEvent(event) {
    if (this._exchange === null) {
      throw new Error('AmqpPublisher not ready to handle events: exchange not available.');
    }

    const key = event.Type + '.' + event.Action;
    const message = JSON.stringify({
      containerId: event.Actor.ID,
      containerMetadata: event.Actor.Attributes
    });

    logger.info('AMQP message published with binding key "' + key + '".');
    this._exchange.publish(key, message, { contentType: 'application/json', deliveryMode: 2 });
  }
}
