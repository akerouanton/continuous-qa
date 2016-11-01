const logger = require('tracer').colorConsole();
const stream = require('stream');

export default class LogStreamer {
  constructor(docker, emitter) {
    this._docker = docker;
    this._emitter = emitter;
  }

  startStreaming(containerId, containerMetadata) {
    logger.debug(`Start streaming logs for "${containerId}".`, {containerId, containerMetadata});

    const container = this._docker.getContainer(containerId);
    const logStream = new stream.PassThrough();

    logStream.setEncoding('utf8');
    logStream.on('data', (chunk) => {
      const log = chunk.slice(1);

      logger.debug(`New log message received for "${containerId}".`, {containerId, containerMetadata, log});
      this._emitter.emit('logReceived', containerId, containerMetadata, log);
    });

    container.logs({details: true, follow: true, stdout: true, stderr: true}, (err, stream) => {
      if (err) {
        this._emitter.emit('error', err);
        return;
      }

      container.modem.demuxStream(stream, logStream, logStream);
    });
  }
}
