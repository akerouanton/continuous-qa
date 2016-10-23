const mongoose = require('mongoose');

export const schema = new mongoose.Schema({
  dependent: {type: mongoose.Schema.Types.ObjectId, required: true},
  dependency: {type: mongoose.Schema.Types.ObjectId, required: true},
  constraint: {type: String, required: true}
});
export default mongoose.model('Dependency', schema);
