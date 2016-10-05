import BuildRepository from '../service/BuildRepository';

/**
 * @api {get} /builds/:projectUrn Get builds for a project
 * @apiName GetBuildsHistory
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParamExample Parameter Example
 *     projectUrn = urn:gh:knplabs/gaufrette
 * @apiSuccess (200) {String}   projectUrn           Project URN
 * @apiSuccess (200) {String}   branch
 * @apiSuccess (200) {Number}   buildId
 * @apiSuccess (200) {String}   repoUrl              Repository URL
 * @apiSuccess (200) {String}   state                Build state (<code>created, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {String}   stages.state         Stage state (<code>queued, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages.runners
 * @apiSuccess (200) {String}   stages.runners.name
 * @apiSuccess (200) {String}   stages.runners.state
 */
export default function GetBuildHistory(req, res, next) {
  BuildRepository
    .findAll(req.params.projectUrn)
    .then(builds => res.status(200).json(builds))
    .catch(err => next(err))
  ;
};
