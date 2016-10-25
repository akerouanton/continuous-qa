const mongoose = require('mongoose');

export const PLUGIN_TYPES = [
  'task-runner',
  'task',
  'scm-platform'
];

export const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  type: {type: String, 'enum': PLUGIN_TYPES, required: true},
  enabled: {type: Boolean, required: true},
  // dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dependency'}],
  endpoints: [String],
  hooks: [String]
});

export default mongoose.model('Plugin', schema);
