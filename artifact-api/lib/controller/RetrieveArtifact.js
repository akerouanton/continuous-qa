class Controller {
  constructor(db) {
    this._db =  db;
  }

  handle(req, res) {

  }
}

export default function(router, db) {
  const controller = new Controller(db);

  /**
   * @api {get} /:urn/:filename Retrieve a file
   * @apiName RetrieveArtifact
   * @apiGroup artifact-api
   * @apiVersion 0.1.0
   * @apiParam {String} urn URN of the bucket
   * @apiParam {String} filename Name of the file to retrieve
   */
  router.get('/:urn/:filename', controller.handle);
}
