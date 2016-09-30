import mongoose from 'mongoose';

function removeInternalFields(doc, ret) {
  delete ret.__v;
  delete ret._id;

  return ret;
}

const stageSchema = new mongoose.Schema({
  runners: [{ type: String }]
}, {toObject: {transform: removeInternalFields}, toJSON: {transform: removeInternalFields}});

export const schema = new mongoose.Schema({
  projectUrn: String,
  pattern: String,
  stages: [stageSchema]
}, {toObject: {transform: removeInternalFields}, toJSON: {transform: removeInternalFields}});
schema.index({projectUrn: 1, pattern: 1}, {unique: true});

export default mongoose.model('Pipeline', schema);
