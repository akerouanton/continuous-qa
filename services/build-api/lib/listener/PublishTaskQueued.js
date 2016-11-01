const _ = require('underscore');

import emitter from '../service/EventEmitter';

export default class PublishTaskQueued {
  static bind(deps) {
    emitter.on('build.post_save', _.partial(PublishTaskQueued.handle, deps.publisher));
  }

  static handle(publisher, build) {
    const stage = build.getRunningStage();
    if (stage !== undefined) {
      _.map(stage.tasks, _.partial(PublishTaskQueued._handleTask, publisher, build, stage));
    }
  }

  static _handleTask(publisher, build, stage, task) {
    if (typeof task._stateUpdated === 'undefined' || task.state !== 'queued') {
      return;
    }

    publisher.publish('task.queued', {build, stage, task});
  }
}
