import PipelineRepository from '../service/PipelineRepository';
import {NoMatchingPipeline, HttpClientError} from '../errors';

/**
 * @api {get} /pipelines/:projectUrn/matching/:branch Find a pipeline matching branch name
 * @apiName FindMatchingPipeline
 * @apiGroup pipeline-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn
 * @apiParam {String} branch
 * @apiParamExample Parameters Example
 *   projectUrn = urn:gh:knplabs/gaufrette
 *   branch = master
 * @apiError (400) InvalidBranch
 * @apiError (404) NoMatchingPipelineFound
 */
export function handleFindMatchingPipeline(req, res, next) {
  return PipelineRepository
    .getMatchingPipeline(req.params.projectUrn, req.params.branch)
    .then((pipeline) => {
      res.format({
        'application/json': () => res.status(200).json(pipeline),
        'default': () => res.sendStatus(406)
      });
    })
    .catch((err) => next(err instanceof NoMatchingPipeline ? new HttpClientError('NoMatchingPipeline', 404) : err))
  ;
}
