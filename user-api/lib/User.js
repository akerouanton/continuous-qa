import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  name: String,
  githubId: Number,
  publicUrl: String,
  cloneUrl: String
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret._id;
    }
  }
});

export const schema = new mongoose.Schema({
  name: String,
  githubId: Number,
  token: String,
  repositories: [repositorySchema]
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret._id;
    }
  }
});

schema.post('findOneAndUpdate', (user) => {
  console.log('kikou2', user);
});

export default mongoose.model('User', schema);
