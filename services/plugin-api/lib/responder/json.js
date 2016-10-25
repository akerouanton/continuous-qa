function getPluginRepresentation(plugin) {
  return {
    name: plugin.name,
    type: plugin.type,
    state: plugin.enabled ? 'enabled' : 'disabled',
    dependencies: [],
    endpoints: plugin.endpoints,
    hooks: plugin.hooks
  };
}

export function displayPlugin(res, plugin) {
  res.json(getPluginRepresentation(plugin));
}

export function displayPluginList(res, plugins) {
  res.json(plugins.map(getPluginRepresentation));
}
