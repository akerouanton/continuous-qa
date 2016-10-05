import mongoose from 'mongoose';

export const schema = new mongoose.Schema({
  projectUrn: {type: String, required: true},
  branch: {type: String, required: true},
  builds: {type: Number, default: 0}
});

export default mongoose.model('Project', schema);
