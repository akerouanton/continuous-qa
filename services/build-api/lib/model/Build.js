const _ = require('underscore');

import mongoose from 'mongoose';
import * as Error from '../Error';
import {default as Stage, schema as stageSchema} from './Build/Stage';
import emitter from '../service/EventEmitter';

export const BUILD_STATES = ['created', 'queued', 'running', 'failed', 'succeeded'];

function removeInternalFields(doc, ret) {
  delete ret.__v;
  delete ret._id;

  ret.urn = doc.urn;

  return ret;
}

export const schema = new mongoose.Schema({
  projectUrn: {type: String, required: true},
  branch: {type: String, required: true},
  buildId: {type: String, required: true},
  repoUrl: {type: String, required: true},
  ref: {type: String, required: true},
  state: {type: String, 'enum': BUILD_STATES, default: 'created', required: true},
  stages: [stageSchema]
}, {toJSON: {transform: removeInternalFields}});
schema.index({ projectUrn: 1, buildId: -1 });
schema.path('stages').get(stages => _.sortBy(stages, stage => stage.position));

schema.virtual('urn').get(function () {
  return `${this.projectUrn}:${this.buildId}`;
});

schema.methods.queue = function (stages) {
  if (this.state !== 'created') {
    throw new Error.InvalidBuildTransitionError(this, 'queued');
  }
  if (stages.length === 0) {
    throw new Error.EmptyStagesError(this);
  }

  this.state = 'queued';
  this.stages = _.map(stages, (stage, position) => Stage.pending(this, position, stage));

  return this;
};

schema.methods.run = function () {
  if (this.state === 'queued') {
    this.state = 'running';
  }
  if (this.state !== 'running') {
    throw new Error.BuildNotRunningError(this);
  }
  if (this.hasRunningStage()) {
    throw new Error.ConcurrentStageRunError(this);
  }

  _.first(this.getPendingStages()).run();
};

schema.methods.updateTaskState = function (stageId, taskName, state) {
  if (this.state !== 'running') {
    throw new Error.BuildNotRunningError(this);
  }

  this.stage(stageId).updateTaskState(taskName, state);

  if (this.stage(stageId).isFinished() && this.stage(stageId).hasSucceeded()) {
    if (!this.hasPendingStages()) {
      this.state = 'succeeded';
      return;
    }

    this.run();
  } else if (this.stage(stageId).isFinished() && this.stage(stageId).hasFailed()) {
    this.state = 'failed';
  }
};

schema.methods.stage = function (id) {
  if (typeof this.stages[id] === 'undefined') {
    throw new Error.StageNotFoundError(this, id);
  }

  return this.stages[id];
};

schema.methods.getPendingStages = function () {
  return _.filter(this.stages, stage => stage.isPending());
};

schema.methods.hasPendingStages = function () {
  return _.some(this.stages, stage => stage.isPending());
};

schema.methods.hasRunningStage = function () {
  return _.some(this.stages, stage => stage.isRunning());
};

schema.methods.getRunningStage = function () {
  return _.find(this.stages, stage => stage.isRunning());
};

schema.methods.fail = function () {
  if (this.state !== 'created') {
    throw new Error.InvalidBuildTransitionError(this, 'failed');
  }

  this.state = 'failed';
};

schema.pre('validate', function (next) {
  emitter.emit('build.pre_validate', this, next);
});
schema.post('save', function (build) {
  emitter.emit('build.post_save', build);
});

schema.virtual('urn').get(function () {
  return `${this.projectUrn}:${this.buildId}`;
});

export default mongoose.model('Build', schema);
