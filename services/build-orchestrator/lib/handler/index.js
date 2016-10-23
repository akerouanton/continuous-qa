const logger = require('tracer').colorConsole();

import BuildCreated from './BuildCreated';
import BuildRunnerFinished from './BuildRunnerFinished';
import BuildRunnerQueued from './BuildRunnerQueued';
import RunnerDie from './RunnerDie';

function log(key) {
  return (message, headers, deliveryInfo) => {
    return logger.info(`New message with key "${key}" received.`);
  };
}

export default function bindHandlers(emitter) {
  emitter.on('build.created', log('build.created'));
  emitter.on('build.created', BuildCreated);
  emitter.on('runner.queued', log('runner.queued'));
  emitter.on('runner.queued', BuildRunnerQueued);
  emitter.on('runner.die', log('runner.die'));
  emitter.on('runner.die', RunnerDie);
  emitter.on('runner.finished', log('runner.finished'));
  emitter.on('runner.finished', BuildRunnerFinished);

  emitter.on('error', (err) => logger.warn(err));
};
