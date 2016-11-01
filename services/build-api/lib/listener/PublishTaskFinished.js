const _ = require('underscore');
const logger = require('tracer').colorConsole();

import emitter from '../service/EventEmitter';

export default class PublishTaskFinished {
  static bind(deps) {
    emitter.on('build.post_save', _.partial(PublishTaskFinished.handle, deps.publisher));
  }

  static handle(publisher, build) {
    const tasks = _.zip(..._.map(build.stages, stage => stage.tasks));
    const taskUpdated = _.first(tasks, task => task._stateUpdated !== undefined);

    if (taskUpdated !== undefined) {
      PublishTaskFinished._handleTask(publisher, build, taskUpdated.stage, taskUpdated);
    }
  }

  static _handleTask(publisher, build, stage, task) {
    if (task.state !== 'failed' && task.state !== 'succeeded') {
      return;
    }

    logger.debug(task.toJSON());
    publisher.publish('task.finished', {build, stage, task});
  }
}
