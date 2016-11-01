import PluginRepository from '../service/PluginRepository';
import {displayPluginList as jsonResponder} from '../responder/json';
import {displayPluginList as halResponder} from '../responder/hal';

/**
 * @api {get} /plugins/ Get a list of registered plugins
 * @apiName ListPlugins
 * @apiGroup plugin-api
 * @apiVersion 0.2.0
 * @apiSuccess (200) {Object[]} plugins
 * @apiSuccess (200) {String}   plugins.name
 * @apiSuccess (200) {String}   plugins.type
 * @apiSuccess (200) {String}   plugins.state
 * @apiSuccess (200) {String[]} plugins.dependencies Dependency name as key, version as value
 * @apiSuccess (200) {Object[]} plugins.endpoints
 * @apiSuccess (200) {Object[]} plugins.hooks
 * @apiSuccess (200) {String}   plugins.platform     Only for "runner" plugins
 */
export function handleListPlugins(req, res, next) {
  PluginRepository
    .list()
    .then((plugins) => {
      res.format({
        'application/json': () => jsonResponder(res.status(200), plugins),
        'application/hal+json': () => halResponder(res.status(200), plugins),
        'default': () => res.sendStatus(406)
      });
    })
    .catch(err => next(err))
  ;
}
