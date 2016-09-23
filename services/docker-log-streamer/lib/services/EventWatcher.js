const logger = require('tracer').colorConsole();

export default class EventWatcher {
  constructor(docker, emitter, containerLabel) {
    this._docker = docker;
    this._emitter = emitter;
    this._containerLabel = containerLabel;
  }

  watchEvents() {
    const now = Math.floor(new Date().getTime() / 1000);
    const filters = {'type': ['container'], 'event': ['start'], 'label': [this._containerLabel]};

    this._docker.getEvents({since: now, filters: filters}, (err, stream) => {
      if (err) {
        this._emitter.emit('error', err);
        return;
      }

      stream.setEncoding('utf8');
      stream.on('readable', () => {
        const event = JSON.parse(stream.read());
        if (!event.Action || !event.Actor || !event.Actor.ID || !event.Actor.Attributes) {
          logger.info('New event received but some mandatory metadata are missing.');

          return;
        }

        this._emitter.emit('runnerCreated', event.Actor.ID, event.Actor.Attributes);
      });

      stream.on('error', (err) => {
        this._emitter.emit('error', err);
      });

      stream.on('end', () => {
        this._emitter.emit('end');
      })
    });

    logger.info('Waiting for docker events.');
  }
}
