const logger = require('tracer').colorConsole();

import BuildRepository from '../service/repository/Build';
import * as Error from '../Error';

/**
 * @api {post} /build/:buildUrn/:stage/:task Update task state
 * @apiName UpdateTaskState
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn URN of the build
 * @apiParam {String} stage   Stage id (starts at 0)
 * @apiParam {String} task  Task name
 * @apiParam {String} state   New state (<code>form-data</code> parameter, either: <code>running</code>, <code>succeeded</code>, <code>failed</code>)
 * @apiParamExample Parameters Example
 *     buildUrn = urn:cqa:gh:knplabs/gaufrette:1
 *     stage = 1
 *     task = php-cs-fixer
 *     state = failed
 * @apiSuccess (200) {String}   urn
 * @apiSuccess (200) {String}   projectUrn           Project URN
 * @apiSuccess (200) {String}   branch
 * @apiSuccess (200) {Number}   buildId
 * @apiSuccess (200) {String}   repoUrl              Repository URL
 * @apiSuccess (200) {String}   ref                  Commit hash
 * @apiSuccess (200) {String}   state                Build state (<code>created, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {Number}   stages.position      Starts at 0
 * @apiSuccess (200) {String}   stages.state         Stage state (<code>queued, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages.tasks
 * @apiSuccess (200) {String}   stages.tasks.type
 * @apiSuccess (200) {String}   stages.tasks.urn
 * @apiSuccess (200) {String}   stages.tasks.state
 * @apiError (400) InvalidState
 * @apiError (400) BuildNotRunning
 * @apiError (400) StageNotRunning
 * @apiError (400) TransitionDisallowed
 * @apiError (404) BuildNotFound
 * @apiError (404) StageNotFound
 * @apiError (404) TaskNotFound
 */
export default function UpdateTaskState(req, res, next) {
  const stageId = req.params.stage;
  const taskName = req.params.task;
  const state = req.body.state || null;

  if (state == null) {
    return res.status(400).json({error: 'InvalidState'});
  }

  BuildRepository
    .get(req.params.projectUrn, req.params.buildId)
    .then((build) => {
      build.updateTaskState(stageId, taskName, state);
      build.save();

      return build;
    })
    .then(build => res.status(200).json(build))
    .catch((err) => {
      if (err instanceof Error.BuildNotFoundError) {
        return res.status(404).json({error: 'BuildNotFound'});
      } else if (err instanceof Error.StageNotFoundError) {
        return res.status(404).json({error: 'StageNotFound'});
      } else if (err instanceof Error.TaskNotFoundError) {
        return res.status(404).json({error: 'TaskNotFound'});
      } else if (err instanceof Error.InvalidStateError) {
        return res.status(400).json({error: 'InvalidState'});
      } else if (err instanceof Error.BuildNotRunningError) {
        return res.status(400).json({error: 'BuildNotRunning'});
      } else if (err instanceof Error.StageNotRunningError) {
        return res.status(400).json({error: 'StageNotRunning'});
      } else if (err instanceof Error.InvalidTaskTransitionError) {
        logger.debug(err);
        return res.status(400).json({error: 'TransitionDisallowed'});
      }

      next(err)
    })
  ;
};
