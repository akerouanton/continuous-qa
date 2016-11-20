import BuildRepository from '../service/repository/Build';
import * as Error from '../Error';

/**
 * @api {post} /build/:buildUrn Change build state
 * @apiName ChangeBuildState
 * @apiGroup build-api
 * @apiVersion 0.2.0
 * @apiParam {String}   buildUrn URN of the build
 * @apiParam {String[]} state
 * @apiParamExample Parameters Example
 *     buildUrn = urn:cqa:gh:knplabs/gaufrette:1
 *     state = failed
 * @apiSuccess (200) {String}   projectUrn           Project URN
 * @apiSuccess (200) {String}   branch
 * @apiSuccess (200) {Number}   buildId
 * @apiSuccess (200) {String}   repoUrl              Repository URL
 * @apiSuccess (200) {String}   ref                  Commit hash
 * @apiSuccess (200) {String}   state                Build state (<code>created, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {String}   stages.state         Stage state (<code>queued, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages.tasks
 * @apiSuccess (200) {String}   stages.tasks.name
 * @apiSuccess (200) {String}   stages.tasks.state
 * @apiError (400) InvalidState
 * @apiError (404) BuildNotFound
 */
export function handle(req, res, next) {
  const {projectUrn, buildId} = req.params;

  BuildRepository
    .get(projectUrn, buildId)
    .then((build) => {
      build.fail();

      return build.save();
    })
    .catch((err) => {
      if (err instanceof Error.BuildNotFoundError) {
        return res.status(404).json({error: 'BuildNotFound'});
      } else if (err instanceof Error.InvalidBuildTransitionError) {
        return res.status(400).json({error: 'InvalidState'});
      }

      next(err);
    })
  ;
}

export function validate(req, res, next) {
  const {state: state = null} = req.body;

  if (state === null) {
    return res.status(400).json({error: 'MissingState'});
  } else if (state !== 'failed') {
    return res.status(400).json({error: 'InvalidState'});
  }

  next();
}
