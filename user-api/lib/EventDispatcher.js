export class EventDispatcher {
  dispatch(name, data = {}) {
    if (false !== name in this._handlers) {
      return;
    }

    for (const handler of this._handlers[name]) {
      data = handler(data);
    }

    return data;
  }

  subscribe(name, callback) {
    if (false === name in this._handlers) {
      this._handlers[name] = [];
    }

    this._handlers[name].push(callback);
  }
}

export default new EventDispatcher();
