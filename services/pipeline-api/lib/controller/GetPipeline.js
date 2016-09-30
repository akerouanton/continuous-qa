import PipelineRepository from '../service/PipelineRepository';
import {PipelineNotFound} from '../Exception';

/**
 * @api {get} /pipeline/:pipelineUrn Retrieve pipeline
 * @apiName GetPipeline
 * @apiGroup pipeline-api
 * @apiVersion 0.1.0
 * @apiParam {String} pipelineUrn Pipeline URN (project urn + branch pattern)
 * @apiParamExample Parameters Example
 *   pipelineUrn = urn:gh:knplabs/gaufrette:feature/*
 * @apiError (400) UrnNotValid      The pipeline URN is not valid
 * @apiError (404) PipelineNotFound
 */
export default class GetPipeline {
  handleRequest(req, res, next) {
    return PipelineRepository
      .getPipeline(req.params.projectUrn, req.params.pattern)
      .then((pipeline) => {
        res.status(200).json(pipeline);
      })
      .catch((err) => {
        if (err instanceof PipelineNotFound) {
          return res.status(404).json({error: 'PipelineNotFound'});
        }
        next(err);
      })
    ;
  }
}
