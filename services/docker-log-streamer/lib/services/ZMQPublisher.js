const zmq = require('zmq');
const msgpack = require('msgpack5')({ compatibilityMode: true });
const encode = msgpack.encode;
const decode = msgpack.decode;
const logger = require('tracer').colorConsole();

export default class ZMQPublisher {
  constructor() {
    this._socket = zmq.socket('pub');
  }

  bind() {
    this._socket.bindSync('tcp://*:3000');

    logger.info('Publisher bound to port 3000.');
  }

  sendMessage(routingKey, message) {
    // const payload = encode(message);
    const payload = JSON.stringify(message);
    logger.debug(`Publishing a new message with routing key "${routingKey}".`);

    this._socket.send([routingKey, payload]);
  }
}
