const _ = require('underscore');

function transformEndpoints(endpoints) {
  const ret = {};

  _.mapObject(endpoints, (val) => ret[val.name] = val.url);

  return ret;
}

function getPluginRepresentation(plugin) {
  return {
    name: plugin.name,
    type: plugin.type,
    state: plugin.enabled ? 'enabled' : 'disabled',
    dependencies: [],
    endpoints: transformEndpoints(plugin.endpoints),
    hooks: plugin.hooks,
    platform: plugin.platform
  };
}

export function displayPlugin(res, plugin) {
  res.json(getPluginRepresentation(plugin));
}

export function displayPluginList(res, plugins) {
  res.json(plugins.map(getPluginRepresentation));
}
