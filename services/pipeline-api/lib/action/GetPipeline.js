import PipelineRepository from '../service/PipelineRepository';
import {PipelineNotFound, HttpClientError} from '../errors';

/**
 * @api {get} /pipeline/:projectUrn/:pattern Retrieve pipeline
 * @apiName GetPipeline
 * @apiGroup pipeline-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn
 * @apiParam {String} pattern
 * @apiParamExample Parameters Example
 *   projectUrn = urn:cqa:gh:knplabs/gaufrette
 *   pattern    = feature/*
 * @apiSuccess (200) {String}   projectUrn
 * @apiSuccess (200) {String}   pattern
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {Object[]} stages.tasks
 * @apiSuccess (200) {String}   stages.tasks.name
 * @apiSuccess (200) {String}   stages.tasks.runner
 * @apiError (400) UrnNotValid
 * @apiError (400) InvalidPattern
 * @apiError (404) PipelineNotFound
 */
export function handleGetPipeline(req, res, next) {
  return PipelineRepository
    .get(req.params.projectUrn, req.params.pattern)
    .then((pipeline) => {
      console.log(pipeline.stages[0].tasks);
      res.format({
        'application/json': () => res.status(200).json(pipeline),
        'default': () => res.sendStatus(406)
      });
    })
    .catch((err) => {
      if (err instanceof PipelineNotFound) {
        return next(new HttpClientError('PipelineNotFound', 404));
      }

      return next(err);
    })
  ;
}
