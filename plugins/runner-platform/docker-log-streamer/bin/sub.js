var zmq = require('zmq');
var sock = zmq.socket('sub');
var msgpack = require('msgpack5')();
var decode = msgpack.decode;
var Buffer = require('buffer').Buffer;

sock.connect('tcp://127.0.0.1:3000');
sock.subscribe('');
console.log('Subscriber connected to port 3000');

sock.on('message', function(topic, message) {
  message = decode(message);
  console.log('received a message related to:', topic.toString(), 'containing message:', message.toString());
});
