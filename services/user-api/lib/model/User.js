import mongoose from 'mongoose';

export const schema = new mongoose.Schema({
  name: String,
  githubId: Number
}, {strict: true});

export default mongoose.model('User', schema);
