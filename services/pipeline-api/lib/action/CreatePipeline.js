const _ = require('underscore');

import Pipeline from '../model/Pipeline';
import PipelineRepository from '../service/PipelineRepository';
import {HttpClientError} from '../errors';

/**
 * @api {put} /pipeline/:projectUrn/:pattern Create new pipeline
 * @apiName CreatePipeline
 * @apiGroup pipeline-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn
 * @apiParam {String} pattern
 * @apiParamExample Parameters Example
 *   projectUrn = urn:gh:knplabs/gaufrette
 *   pattern = feature/*
 *   stages[0][tasks][0][name] = php-cs-fixer
 *   stages[0][tasks][0][runner] = php-cs-fixer
 * @apiSuccess (200) {String}   projectUrn
 * @apiSuccess (200) {String}   pattern
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {Object[]} stages.tasks
 * @apiSuccess (200) {String}   stages.tasks.name
 * @apiSuccess (200) {String}   stages.tasks.runner
 * @apiError (400) UrnNotValid    The pipeline URN is not valid
 * @apiError (400) MissingStages
 */
export function handleCreatePipeline(req, res, next) {
  const {pattern, projectUrn} = req.params;
  const stages = _.map(req.body.stages, (stage, position) => {
    stage.position = position;
    return stage;
  });
  const pipeline = new Pipeline({projectUrn, pattern, stages});

  PipelineRepository
    .upsert(pipeline)
    .then(() => {
      const statusCode = pipeline.isNew ? 201 : 200;

      res.format({
        'application/json': () => res.status(statusCode).json(pipeline),
        'default': () => res.sendStatus(406)
      });
    })
    .catch((err) => next(err))
  ;
}

export function validateCreatePipeline(req, res, next) {
  const stages = req.body.stages;

  if (stages === null) {
    return next(new HttpClientError('MissingStages'));
  } else if (_.isArray(stages) === false) {
    return next(new HttpClientError('InvalidStages'));
  }

  const invalidTask = _.find(stages, (stage) => {
    console.log(_.find(stage.tasks, (task) => {
        return task.name === undefined || task.runner === undefined;
      }));
    return stage.tasks === undefined || undefined !== _.find(stage.tasks, (task) => {
      return task.name === undefined || task.runner === undefined;
    });
  });

  if (invalidTask !== undefined) {
    return next(new HttpClientError('InvalidStages'));
  }

  next();
}
