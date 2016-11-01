const logger = require('tracer').colorConsole();

import {onBuildCreated} from './BuildCreated';
import {onTaskQueued} from './TaskQueued';
import {onTaskFinished} from './TaskFinished';
import {onRunnerDie} from './RunnerDie';

function log(key) {
  return (message, headers, deliveryInfo) => {
    return logger.info(`New message with key "${key}" received.`);
  };
}

export default function bindHandlers(emitter) {
  emitter.on('build.created', log('build.created'));
  emitter.on('build.created', onBuildCreated);
  emitter.on('task.queued', log('task.queued'));
  emitter.on('task.queued', onTaskQueued);
  emitter.on('runner.die', log('runner.die'));
  emitter.on('runner.die', onRunnerDie);
  emitter.on('task.finished', log('task.finished'));
  emitter.on('task.finished', onTaskFinished);

  emitter.on('error', (err) => logger.warn(err));
};
