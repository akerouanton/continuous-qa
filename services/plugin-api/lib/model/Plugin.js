const mongoose = require('mongoose');

export const PLUGIN_TYPES = [
  'runner',
  'runner-platform',
  'scm-platform'
];

const endpointSchema = new mongoose.Schema({
  name: {type: String, required: true},
  url: {type: String, required: true}
});

export const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  type: {type: String, 'enum': PLUGIN_TYPES, required: true},
  enabled: {type: Boolean, required: true},
  // dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dependency'}],
  endpoints: [endpointSchema],
  hooks: [String],
  platform: String
});

export default mongoose.model('Plugin', schema);
