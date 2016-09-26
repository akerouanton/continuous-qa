/**
 * @api {get} /logs/:analysisUrn Get logs for a specific analysis
 * @apiName GetLogs
 * @apiGroup log-api
 * @apiVersion 0.1.0
 * @apiParam {String} analysisUrn URN of the analysis
 * @apiError (400) UrnNotValid The analysis URN is not valid
 */
export default class App {
  constructor(repository) {
    this._repository = repository;
  }

  handleRequest(req, res, next) {
    this
      ._repository
      .getLogs(req.params.analysisUrn)
      .then((logs) => {
        res.status(200).json(logs);
      })
      .catch((err) => {
        next(err);
      })
    ;
  }
}
