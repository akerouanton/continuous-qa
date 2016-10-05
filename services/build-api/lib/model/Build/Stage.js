const _ = require('underscore');

import mongoose from 'mongoose';
import * as Error from '../../Exception';
import {schema as runnerSchema} from './Stage/Runner';

export const STAGE_STATES = ['pending', 'running', 'failed', 'succeeded'];

function toJSON(doc, ret) {
  delete ret.__v;
  delete ret._id;
  delete ret.position;

  // Transform flat array of states into an associative array of runner name and state
  ret.runners = _.object(_.map(doc.runners, runner => runner.name), ret.runners);

  return ret;
}

export const schema = new mongoose.Schema({
  state: {type: String, 'enum': STAGE_STATES, required: true},
  position: {type: Number, required: true},
  runners: [runnerSchema]
}, {toJSON: {transform: toJSON}});

schema.virtual('urn', function () {
  return `${this.parent().urn}:${this.position}`;
});

schema.statics.pending = function (position, runners) {
  return new Stage({
    state: 'pending',
    position: position,
    runners: _.map(runners, runner => new Object({name: runner, state: 'pending'}))
  });
};

schema.methods.run = function () {
  if (this.state !== 'pending') {
    throw new Error.StageNotPendingError(this, 'running');
  }

  this.state = 'running';
  this.runners.forEach(runner => runner.queue());
};

schema.methods.updateRunnerState = function (runnerName, state) {
  if (this.state !== 'running') {
    throw new Error.StageNotRunningError(this);
  }

  this.runner(runnerName).updateState(state);

  if (!this.hasRemainingRunners()) {
    this.state = this.hasFailedRunners() ? 'failed' : 'succeeded';
  }
};

schema.methods.runner = function(name) {
  const found = _.find(this.runners, runner => runner.name === name);
  if (typeof found === 'undefined') {
    throw new Error.RunnerNotFoundError(this, name);
  }

  return found;
};

schema.methods.hasRemainingRunners = function () {
  return _.some(this.runners, runner => runner.isRemaining());
};

schema.methods.hasFailedRunners = function () {
  return _.some(this.runners, runner => runner.hasFailed());
};

schema.methods.isPending = function () {
  return this.state === 'pending';
};

schema.methods.isRunning = function () {
  return this.state === 'running';
};

schema.methods.isFinished = function () {
  return this.state === 'failed' || this.state === 'succeeded';
};

schema.methods.hasSucceeded = function () {
  return this.state === 'succeeded';
};

schema.methods.hasFailed = function () {
  return this.state === 'failed';
};

const Stage = mongoose.model('Stage', schema);
export default Stage;
