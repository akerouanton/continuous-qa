const Docker = require('dockerode');

export default class {
  constructor(emitter, config) {
    this._emitter = emitter;
    this._docker = new Docker({ socketPath: config.socketPath });
    this._config = config;
  }

  listenEvents() {
    const now = Math.floor(new Date().getTime() / 1000);
    const filters = {'event': ['die', 'start'], 'label': [this._config.containerLabel]};

    this._docker.getEvents({since: now, filters: filters}, (err, stream) => {
      if (err) {
        this._emitter.emit('error', err);
        return;
      }

      stream.setEncoding('utf8');

      stream.on('readable', () => {
        this._emitter.emit('eventReceived', JSON.parse(stream.read()));
      });
      stream.on('error', (err) => {
        this._emitter.emit('error', err);
      });
      stream.on('end', () => {
        this._emitter.emit('end');
      })
    });
  }
}
