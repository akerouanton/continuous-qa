const logger = require('tracer').colorConsole();

export default class EventPublisher {
  constructor(exchange) {
    this._exchange = exchange;
  }

  publish(eventName, message) {
    logger.debug(`Sending a message with key "${eventName}".`);

    this._exchange.publish(eventName, JSON.stringify(message), {contentType: 'application/json'});
  }
}
