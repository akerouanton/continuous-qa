import {default as BuildRepository} from '../service/BuildRepository';
import {BuildNotFoundError} from '../Exception';

/**
 * @api {get} /build/:buildUrn Get a specific build
 * @apiName GetBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn URN of the build
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:1
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
 * @apiError (404) BuildNotFound
 */
export default function GetBuild(req, res, next) {
  BuildRepository
    .get(req.params.projectUrn, req.params.buildId)
    .then(build => res.status(200).json(build))
    .catch((err) => {
      if (err instanceof BuildNotFoundError) {
        return res.status(404).json({error: 'BuildNotFound'});
      }

      next(err);
    })
  ;
};
