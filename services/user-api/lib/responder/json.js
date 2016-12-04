export default function jsonResponder(res, user) {
  res.json({
    name: user.name,
    repositories: user.repositories.map(({name}) => { return {name, urn: `urn:cqa:gh:${name}`}; })
  });
}
