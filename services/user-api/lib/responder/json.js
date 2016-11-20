export default function jsonResponder(res, user) {
  res.json({
    name: user.name,
    repositories: user.repositories
  });
}
