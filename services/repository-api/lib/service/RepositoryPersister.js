export function save(repository) {
  return repository.save().then(() => repository);
}
