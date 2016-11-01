const _ = require('underscore');

import mongoose from 'mongoose';
import * as Error from '../../Error';
import {schema as taskSchema} from './Stage/Task';

export const STAGE_STATES = ['pending', 'running', 'failed', 'succeeded'];

function toJSON(doc, ret) {
  delete ret.__v;
  delete ret._id;

  ret.urn = doc.urn;

  return ret;
}

export const schema = new mongoose.Schema({
  state: {type: String, 'enum': STAGE_STATES, required: true},
  position: {type: Number, required: true},
  tasks: [taskSchema]
}, {toJSON: {transform: toJSON}});

schema.statics.pending = function (build, position, {tasks}) {
  const stage = new Stage({
    state: 'pending',
    position: position,
    tasks: _.map(tasks, ({name, runner, platform}) => new Object({name, runner, platform, state: 'pending'}))
  });
  stage.build = build;
  return stage;
};

schema.methods.run = function () {
  if (this.state !== 'pending') {
    throw new Error.StageNotPendingError(this, 'running');
  }

  this.state = 'running';
  this.tasks.forEach(task => task.queue());
};

schema.methods.updateTaskState = function (taskName, state) {
  if (this.state !== 'running') {
    throw new Error.StageNotRunningError(this);
  }

  this.task(taskName).updateState(state);

  if (!this.hasRemainingTasks()) {
    this.state = this.hasFailedTasks() ? 'failed' : 'succeeded';
  }
};

schema.methods.task = function(name) {
  const found = _.find(this.tasks, task => task.name === name);
  if (typeof found === 'undefined') {
    throw new Error.TaskNotFoundError(this, name);
  }

  return found;
};

schema.methods.hasRemainingTasks = function () {
  return _.some(this.tasks, task => task.isRemaining());
};

schema.methods.hasFailedTasks = function () {
  return _.some(this.tasks, task => task.hasFailed());
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

schema.virtual('urn').get(function () {
  return `${this.build.urn}:${this.position}`;
});
schema.virtual('build').set(function (build) {
  this._build = build;
});
schema.virtual('build').get(function () {
  return (this.parent !== undefined && this.parent()) || this._build;
});

const Stage = mongoose.model('Stage', schema);
export default Stage;
