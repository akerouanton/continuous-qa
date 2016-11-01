import Plugin from '../model/Plugin';
import {PluginNotFoundError} from '../domain/errors';

export default class PluginRepository {
  static upsert(plugin) {
    const {name, type, endpoints, hooks, platform} = plugin;

    return Plugin
      .findOneAndUpdate({name}, {type, endpoints, hooks, platform})
      .exec()
      .then((result) => {
        if (result === null) {
          plugin.save();
          plugin.isNew = true;
          return plugin;
        }

        return result;
      })
    ;
  }

  static find(name) {
    return Plugin.findOne({name}).exec();
  }

  static get(name) {
    return PluginRepository
      .find(name)
      .then((plugin) => {
        if (plugin === null) {
          throw new PluginNotFoundError(name);
        }

        return plugin;
      })
    ;
  }

  static list() {
    return Plugin.find().exec();
  }

  static drop({name}) {
    return Plugin.remove({name}).exec();
  }
}
