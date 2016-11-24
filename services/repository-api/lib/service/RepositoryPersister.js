import Repository from '../model/Repository';

export async function upsert(repository) {
  const {name, enabled, passphrase, deployKeyId} = repository;

  const result = await Repository.findOneAndUpdate({name}, {enabled, passphrase, deployKeyId}).exec();
  if (result === null) {
    return repository.save().then(() => {
      repository.isNew = true;
      return repository;
    });
  }

  return result;
}
