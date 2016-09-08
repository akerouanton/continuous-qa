export default class {
  static handle(req, res) {
    if (false === "githubId" in req.session) {
      res.redirect('/');
      res.end();
      return;
    }

    req.session.destroy();
    res.sendStatus(200).end();
  }
}
