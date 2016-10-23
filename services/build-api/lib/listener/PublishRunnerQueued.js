const _ = require('underscore');

import emitter from '../service/EventEmitter';

export default class PublishRunnerQueued {
  static bind(deps) {
    emitter.on('build.post_save', _.partial(PublishRunnerQueued.handle, deps.publisher));
  }

  static handle(publisher, build) {
    const stage = build.getRunningStage();
    if (stage !== undefined) {
      _.map(stage.runners, _.partial(PublishRunnerQueued._handleRunner, publisher, build, stage));
    }
  }

  static _handleRunner(publisher, build, stage, runner) {
    if (typeof runner._stateUpdated === 'undefined' || runner.state !== 'queued') {
      return;
    }

    publisher.publish('runner.queued', {buildUrn: build.urn, stage: stage.position, runnerType: runner.name});
  }
}
