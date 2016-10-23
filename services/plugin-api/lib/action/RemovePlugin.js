import PluginRepository from '../service/PluginRepository';

/**
 * @api {demete} /plugin/:name Remove plugin
 * @apiName RemovePlugin
 * @apiGroup plugin-api
 * @apiVersion 0.2.0
 * @apiParam {String}   name
 * @apiSuccess (204)
 */export function handleRemovePlugin(req, res, next) {
  const {name} = req.params;

  PluginRepository
    .drop({name})
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err))
  ;
}
