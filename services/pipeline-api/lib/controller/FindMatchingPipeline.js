import PipelineRepository from '../service/PipelineRepository';
import {NoMatchingPipeline} from '../Exception';

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
 * @apiSuccess (200) {String}   projectUrn
 * @apiSuccess (200) {String}   pattern
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {String[]} stages.runners
 * @apiError (404) NoMatchingPipelineFound
 */
export default class FindMatchingPipeline {
  handleRequest(req, res, next) {
    return PipelineRepository
      .getMatchingPipeline(req.params.projectUrn, req.params.branch)
      .then((pipeline) => {
        res.status(200).json(pipeline);
      })
      .catch((err) => {
        if (err instanceof NoMatchingPipeline) {
          return res.status(404).json({error: 'NoMatchingPipelineFound'});
        }
        next(err);
      })
    ;
  }
}
