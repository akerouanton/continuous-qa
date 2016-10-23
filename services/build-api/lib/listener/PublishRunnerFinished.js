const _ = require('underscore');

import emitter from '../service/EventEmitter';

export default class PublishRunnerFinished {
  static bind(deps) {
    emitter.on('build.post_save', _.partial(PublishRunnerFinished.handle, deps.publisher));
  }

  static handle(publisher, build) {
    const runners = _.zip(..._.map(build.stages, stage => stage.runners));
    const runnerUpdated = _.first(runners, runner => runner._stateUpdated !== undefined);

    if (runnerUpdated !== undefined) {
      PublishRunnerFinished._handleRunner(publisher, runnerUpdated);
    }
  }

  static _handleRunner(publisher, runner) {
    if (runner.state !== 'failed' & runner.state !== 'succeeded') {
      return;
    }

    publisher.publish('runner.finished', {runnerUrn});
  }
}
