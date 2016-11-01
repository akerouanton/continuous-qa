const Docker = require('dockerode');
const EventEmitter = require('events');
const logger = require('tracer').colorConsole();
const config = require('config');

import EventWatcher from './services/EventWatcher';
import LogStreamer from './services/LogStreamer';
import ZMQPublisher from './services/ZMQPublisher';

export default class App {
  constructor() {
    logger.debug(config);
    const docker = new Docker({socketPath: config.docker_socket});

    this._emitter   = new EventEmitter();
    this._watcher   = new EventWatcher(docker, this._emitter, config.container_label);
    this._streamer  = new LogStreamer(docker, this._emitter);
    this._publisher = new ZMQPublisher();

    this._boot();
  }

  _boot() {
    this._emitter.on('runnerCreated', this._streamer.startStreaming.bind(this._streamer));
    this._emitter.on('logReceived', this._onLogReceived.bind(this));

    this._emitter.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });

    this._emitter.on('end', () => {
      logger.info('Docker stream ended.');
      process.exit(0);
    });
  }

  _onLogReceived(containerId, containerMetadata, log) {
    const runnerUrn = containerMetadata[`${config.runner_urn_label}`];

    if (!runnerUrn) {
      logger.error('Missing runnerUrn from container metadata.');
      return;
    }

    this._publisher.sendMessage(runnerUrn, {runnerUrn, log});
  }

  run() {
    this._publisher.bind();
    this._watcher.watchEvents();
  }
}
