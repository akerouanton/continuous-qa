const _ = require('underscore');
const logger = require('tracer').colorConsole();

import BuildRepository from '../service/repository/Build';
import * as Error from '../Error';

/**
 * @api {post} /build/:buildUrn/run Run a build
 * @apiName RunBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String}   buildUrn         URN of the build
 * @apiParam {String[]} stages[][]
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:1
 *     stages[0][0] = php-cs-fixer
 *     stages[0][1] = phpqa
 * @apiSuccess (200) {String}   projectUrn           Project URN
 * @apiSuccess (200) {String}   branch
 * @apiSuccess (200) {Number}   buildId
 * @apiSuccess (200) {String}   repoUrl              Repository URL
 * @apiSuccess (200) {String}   Ref                  Commit hash
 * @apiSuccess (200) {String}   state                Build state (<code>created, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {String}   stages.state         Stage state (<code>queued, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages.tasks
 * @apiSuccess (200) {String}   stages.tasks.name
 * @apiSuccess (200) {String}   stages.tasks.state
 * @apiError (400) InvalidStages
 * @apiError (400) InvalidState
 * @apiError (404) BuildNotFound
 */
export default function RunBuild(req, res, next) {
  const stages = req.body.stages || [];

  if (stages.constructor !== Array || stages.length === 0) {
    return res.status(400).json({error: 'InvalidStages'});
  }

  BuildRepository
    .get(req.params.projectUrn, req.params.buildId)
    .then((build) => {
      build.queue(stages).run();

      return build.save();
    })
    .then(build => res.status(200).json(build.toObject()))
    .catch((err) => {
      if (err instanceof Error.BuildNotFoundError) {
        return res.status(404).json({error: 'BuildNotFound'});
      } else if (err instanceof Error.InvalidBuildTransitionError) {
        return res.status(400).json({error: 'InvalidState'});
      }

      next(err);
    })
  ;
};
