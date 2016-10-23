import halson from 'halson';
import {generateUrl} from '../router';

function getPluginRepresentation(plugin) {
  const resource = halson({
    name: plugin.name,
    type: plugin.type,
    state: plugin.enabled ? 'enabled' : 'disabled',
    hooks: plugin.hooks
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
