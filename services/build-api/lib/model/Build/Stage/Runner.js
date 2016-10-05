const _ = require('underscore');

import mongoose from 'mongoose';
import * as Error from '../../../Exception';

export const RUNNER_STATES = ['pending', 'queued', 'running', 'failed', 'succeeded'];
export const RUNNER_TRANSITIONS = {
  'pending': ['queued'],
  'queued': ['running'],
  'running': ['failed', 'succeeded']
};

function toJSON(doc, ret) {
  ret = ret.state;
  return ret;
}

export const schema = new mongoose.Schema({
  name: {type: String, required: true},
  state: {type: String, 'enum': RUNNER_STATES, required: true}
}, {toJSON: {transform: toJSON}});

schema.virtual('urn', function () {
  return `${this.parent().urn}:${this.name}`;
});

schema.methods.queue = function () {
  this.state = 'queued';
};

schema.methods.updateState = function (state) {
  if (!_.contains(RUNNER_STATES, state)) {
    throw new Error.InvalidStateError(state);
  }
  if (!_.contains(RUNNER_TRANSITIONS[this.state], state)) {
    throw new Error.InvalidRunnerTransitionError(this, state);
  }

  this.state = state;
};

schema.methods.isRemaining = function () {
  return this.state !== 'failed' && this.state !== 'succeeded';
};

schema.methods.hasFailed = function () {
  return this.state === 'failed';
};
