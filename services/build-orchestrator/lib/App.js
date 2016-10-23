import Consumer from './Consumer';
import EventEmitter from './service/PromisifiedEventEmitter';
import bindHandlers from './handler/index';

export default class {
  constructor() {
    const emitter = new EventEmitter();
    this._consumer = new Consumer(emitter);
    bindHandlers(emitter);
  }

  run() {
    this._consumer.connect();
  }
}
