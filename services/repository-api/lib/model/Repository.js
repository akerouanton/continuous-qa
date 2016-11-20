import mongoose from 'mongoose';

export const schema = mongoose.Schema({
  name: {type: String, required: true, unique: true},
  type: {type: String, required: true},
  urn: {type: String, required: true},
  passphrase: {type: String},
  deployKeyId: {type: String}
}, {strict: true});

schema.statics.urn = function (name) {
  return `urn:cqa:gh:${name}`;
};

schema.pre('validate', function (next) {
  if (this.urn === undefined) {
    this.urn = Repository.urn(this.name);
  }

  next();
});

const Repository = mongoose.model('Repository', schema);
export default Repository;
