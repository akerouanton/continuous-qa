const tracer = require('tracer').console();

class Controller {
  constructor(db) {
    this._db = db;
  }

  handle(req, res) {
    db
      .collection('artifacts')
      .findOne({'urn': req.param.urn})
      .then((artifacts) => {
        if (artifacts === []) {
          res.sendStatus(404);
          res.send();
        }

        res.sendStatus(200);
        res.end();
      })
      .catch((err) => {
        tracer.log(err);

        res.sendStatus(500);
        res.end();
      })
    ;
  }
}

export default function (router, db) {
  const controller = new Controller(db);

  /**
   * @api {get} /:urn/ List artifacts attached to a :urn
   * @apiName ListArtifacts
   * @apiGroup artifact-api
   * @apiVersion 0.1.0
   * @apiParam {String} urn URN of the bucket
   */
  router.get('/:urn/', controller.handle);
}
