const _ = require('underscore');

export default class PromisifiedEventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(eventName, listener) {
    if (typeof this._listeners[eventName] === 'undefined') {
      this._listeners[eventName] = [];
    }

    this._listeners[eventName].push(listener);
  }

  emit(eventName, ...data) {
    if (typeof this._listeners[eventName] === 'undefined') {
      return Promise.resolve();
    }

    return Promise
      .all(_.values(_.map(this._listeners[eventName], listener => listener(...data))))
      .catch((err) => {
        this.emit('error', err);
        return Promise.reject(err);
      })
    ;
  }
}
