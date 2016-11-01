import PipelineRepository from '../service/PipelineRepository';

/**
 * @api {get} /pipelines/:projectUrn List pipelines associated to a project
 * @apiName ListPipelines
 * @apiGroup pipeline-api
 * @apiVersion 0.2.0
 * @apiParam {String} projectUrn
 * @apiParamExample Parameters Example
 *   projectUrn = urn:gh:knplabs/gaufrette
 * @apiSuccess (200) {Object[]} pipelines
 * @apiSuccess (200) {String}   pipelines.projectUrn
 * @apiSuccess (200) {String}   pipelines.pattern
 * @apiSuccess (200) {Object[]} pipelines.stages
 * @apiSuccess (200) {Object[]} pipelines.stages.tasks
 * @apiSuccess (200) {String}   pipelines.stages.tasks.name
 * @apiSuccess (200) {String}   pipelines.stages.tasks.runner
 * @apiError (400) UrnNotValid
 */
export function handleListPipelines(req, res, next) {
  const {projectUrn} = req.params;

  PipelineRepository
    .find(projectUrn)
    .then((pipelines) => {
      res.format({
        'application/json': () => res.status(200).json(pipelines),
        'default': () => res.sendStatus(406)
      });
    })
    .catch((err) => next(err))
  ;
}
