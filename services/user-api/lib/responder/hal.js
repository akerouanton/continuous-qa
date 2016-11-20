import halson from 'halson';

export default function halResponder(res, user) {
  res.json(getUserRepresentation(user));
}

function getUserRepresentation(user) {
  const resource = halson({name: user.name, fullname: user.fullname});

  return resource
    .addEmbed('repositories', user.repositories.map(getRepositoryRepresentation))
    .addLink('self', '/profile')
  ;
}

function getRepositoryRepresentation(repository) {
  return repository;
}
