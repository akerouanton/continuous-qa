import UserRepository from './UserRepository';

export default class {
  static handle(req, res) {
    if (false === "githubId" in req.session) {
      res.redirect("/connect/github")
      res.end();
      return;
    }

    UserRepository
      .getByGithubId(req.session.githubId)
      .then((user) => {
        res.send(user.toObject());
        res.end();
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
        res.end();
      })
    ;
  }
}
