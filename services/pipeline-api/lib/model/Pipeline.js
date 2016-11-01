const _ = require('underscore');

import mongoose from 'mongoose';

function removeInternalFields(doc, ret) {
  delete ret.__v;
  delete ret._id;

  if (ret.position !== undefined) {
    delete ret.position;
  }

  return ret;
}

const taskSchema = new mongoose.Schema({
  name: {type: String, required: true},
  runner: {type: String, required: true}
}, {toJSON: {transform: removeInternalFields}});

const stageSchema = new mongoose.Schema({
  tasks: [taskSchema],
  position: {type: Number, required: true},
}, {toJSON: {transform: removeInternalFields}});

export const schema = new mongoose.Schema({
  projectUrn: String,
  pattern: String,
  stages: [stageSchema]
}, {toJSON: {transform: removeInternalFields}});
schema.index({projectUrn: 1, pattern: 1}, {unique: true});
schema.path('stages').get(stages => _.sortBy(stages, stage => stage.position));

export default mongoose.model('Pipeline', schema);
