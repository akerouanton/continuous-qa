const _ = require('underscore');

import mongoose from 'mongoose';
import * as Error from '../../../Error';

export const RUNNER_STATES = ['pending', 'queued', 'running', 'failed', 'succeeded'];
export const RUNNER_TRANSITIONS = {
  'pending': ['queued'],
  'queued': ['running'],
  'running': ['failed', 'succeeded']
};

function toJSON(doc, ret) {
  return {
    name: doc.name,
    runner: doc.runner,
    platform: doc.platform,
    state: doc.state,
    urn: `${doc.parent().urn}:${doc.name}`
  };
}

export const schema = new mongoose.Schema({
  name: {type: String, required: true},
  runner: {type: String, required: true},
  state: {type: String, 'enum': RUNNER_STATES, required: true},
  platform: String
}, {toJSON: {transform: toJSON}});

schema.methods.queue = function () {
  this._changeState('queued');
};

schema.methods.updateState = function (state) {
  if (!_.contains(RUNNER_TRANSITIONS[this.state], state)) {
    throw new Error.InvalidTaskTransitionError(this, state);
  }

  this._changeState(state);
};

schema.methods._changeState = function (state) {
  if (!_.contains(RUNNER_STATES, state)) {
    throw new Error.InvalidStateError(state);
  }

  this._stateUpdated = true;
  this.state = state;
};

schema.methods.isRemaining = function () {
  return this.state !== 'failed' && this.state !== 'succeeded';
};

schema.methods.hasFailed = function () {
  return this.state === 'failed';
};

schema.methods.stage = function () {
  return this.parent();
};
