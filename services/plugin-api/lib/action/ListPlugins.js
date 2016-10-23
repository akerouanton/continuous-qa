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
 * @apiSuccess (200) {Object[]} plugins.hooks
 */
export function handleListPlugins(req, res, next) {
  PluginRepository
    .list()
    .then((plugins) => {
      res.format({
        'application/json': () => {
          res.status(200);
          jsonResponder(res, plugins)
        },
        'application/hal+json': () => {
          res.status(200);
          halResponder(res, plugins)
        },
        'default': () => {
          res.sendStatus(406);
        }
      })
    })
    .catch(err => next(err))
  ;
}
