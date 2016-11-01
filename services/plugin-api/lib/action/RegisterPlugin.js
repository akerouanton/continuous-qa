import {default as Plugin, PLUGIN_TYPES} from '../model/Plugin';
import * as errors from '../errors';
import {displayPlugin as jsonResponder} from '../responder/json';
import {displayPlugin as halResponder} from '../responder/hal';
import PluginRepository from '../service/PluginRepository';

/**
 * @api {put} /plugin/:name Register or update a plugin
 * @apiName RegisterPlugin
 * @apiGroup plugin-api
 * @apiVersion 0.2.0
 * @apiParam {String}   name
 * @apiParam {String}   type         Valid types: <code>task-runner</code>, <code>runner</code>, <code>scm-platform</code>
 * @apiParam {String[]} dependencies Dependency name as key, version as value
 * @apiParam {Object[]} endpoints
 * @apiParam {Object[]} hooks
 * @apiParam {String}   platform     Only for "runner" plugins. Must be a "runner-platform" plugin.
 * @apiSuccess (200) {String}   name
 * @apiSuccess (200) {String}   type
 * @apiSuccess (200) {String[]} dependencies Dependency name as key, version as value
 * @apiSuccess (200) {Object[]} endpoints
 * @apiSuccess (200) {Object[]} hooks
 * @apiSuccess (200) {String}   platform     Only for "runner" plugins
 * @apiError (400) MissingType
 * @apiError (400) InvalidType
 * @apiError (400) MissingDependencies
 * @apiError (400) MissingHooks
 */
export function handleRegisterPlugin(req, res, next) {
  const {name} = req.params;
  const {type, endpoints, hooks, platform = null} = req.body;
  const plugin = new Plugin({name, type, endpoints, hooks, platform, enabled: true});

  PluginRepository
    .upsert(plugin)
    .then(plugin => {
      const statusCode = plugin.isNew ? 201 : 200;

      res.format({
        'application/json': () => jsonResponder(res.status(statusCode), plugin),
        'application/hal+json': () => halResponder(res.status(statusCode), plugin),
        'default': () => res.sendStatus(406)
      });
    })
    .catch(err => next(err))
  ;
}

export function validateRegisterPlugin(req, res, next) {
  const {type = null, dependencies = {}, hooks = {}} = req.body;

  if (type === null) {
    return next(new errors.MissingTypeError());
  } else if (PLUGIN_TYPES.indexOf(type) === -1) {
    return next(new errors.InvalidTypeError(type));
  } else if (dependencies === null) {
    return next(new errors.MissingDependenciesError());
  } else if (hooks === null) {
    return next(new errors.MissingHooksError());
  }

  next();
}
