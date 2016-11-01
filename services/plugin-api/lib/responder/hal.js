const _ = require('underscore');

import halson from 'halson';
import {generateUrl} from '../router';

function transformEndpoints(endpoints) {
  const ret = {};

  _.mapObject(endpoints, (val) => ret[val.name] = val.url);

  return ret;
}

function getPluginRepresentation(plugin) {
  const resource = halson({
    name: plugin.name,
    type: plugin.type,
    state: plugin.enabled ? 'enabled' : 'disabled',
    dependencies: [],
    endpoints: transformEndpoints(plugin.endpoints),
    hooks: plugin.hooks,
    platform: plugin.platform
  });

  return resource
    .addEmbed('depenencies', [])
    .addLink('self', generateUrl('GetPlugin', {name: plugin.name}))
  ;
}

export function displayPlugin(res, plugin) {
  res.json(getPluginRepresentation(plugin));
}

export function displayPluginList(res, plugins) {
  const resource = halson()
    .addEmbed('plugins', plugins.map(getPluginRepresentation))
    .addLink('self', generateUrl('ListPlugins'))
  ;

  res.json(resource);
}
