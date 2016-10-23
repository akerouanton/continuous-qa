function getPluginRepresentation(plugin) {
  return {
    name: plugin.name,
    type: plugin.type,
    dependencies: [],
    hooks: plugin.hooks
  };
}

export function displayPlugin(res, plugin) {
  res.json(getPluginRepresentation(plugin));
}

export function displayPluginList(res, plugins) {
  res.json(plugins.map(getPluginRepresentation));
}
