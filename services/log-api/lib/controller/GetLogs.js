/**
 * @api {get} /logs/:bucketUrn Get logs in a specific bucket
 * @apiName GetLogs
 * @apiGroup log-api
 * @apiVersion 0.1.0
 * @apiParam {String} bucketUrn
 * @apiError (400) UrnNotValid
 */
export default class App {
  constructor(repository) {
    this._repository = repository;
  }

  handleRequest(req, res, next) {
    this
      ._repository
      .getLogs(req.params.bucketUrn)
      .then((logs) => {
        res.status(200).json(logs);
      })
      .catch((err) => {
        next(err);
      })
    ;
  }
}
