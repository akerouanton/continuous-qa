import emitter from '../service/EventEmitter';

export default function (eventName) {
  return function (next) {
    try {
      emitter.emit(eventName, this, next);
    } catch (err) {
      return next(err);
    }
  };
}
