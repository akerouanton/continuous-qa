import Pipeline from '../model/Pipeline';
import PipelineRepository from '../service/PipelineRepository';
import ExtendableError from 'es6-error';

class PipelineAlreadyExistsError extends ExtendableError {
  constructor(projectUrn, pattern) {
    super(`Pipeline with pattern "${pattern}" for "${projectUrn}" already exists.`);
  }
}

/**
 * @api {put} /pipeline/:pipelineUrn Create new pipeline
 * @apiName CreatePipeline
 * @apiGroup pipeline-api
 * @apiVersion 0.1.0
 * @apiParam {String} pipelineUrn Pipeline URN (project urn + branch pattern)
 * @apiParamExample Parameters Example
 *   pipelineUrn = urn:gh:knplabs/gaufrette:feature/*
 * @apiError (400) UrnNotValid           The pipeline URN is not valid
 * @apiError (409) PipelineAlreadyExists
 */
export default class CreatePipeline {
  handleRequest(req, res, next) {
    const projectUrn = req.params.projectUrn;
    const pattern = req.params.pattern;

    const pipeline = new Pipeline({
      projectUrn: projectUrn,
      pattern: pattern,
      stages: [
        {runners: ['php-cs-fixer', 'phpqa']}
      ]
    });

    PipelineRepository
      .findPipeline(projectUrn, pattern)
      .then((result) => {
        if (result !== null) {
          throw new PipelineAlreadyExistsError(projectUrn, pattern);
        }

        return pipeline.save();
      })
      .then(() => {
        res.status(200).json(pipeline);
      })
      .catch((err) => {
        if (err instanceof PipelineAlreadyExistsError) {
          return res.status(409).json({error: 'PipelineAlreadyExists'});
        }

        next(err);
      })
    ;
  }
}
