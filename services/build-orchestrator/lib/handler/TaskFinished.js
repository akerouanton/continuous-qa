import {getPluginEndpoint} from '../service/PluginGateway';
import {dropTaskRunner} from '../service/RunnerGateway';

export function onTaskFinished({task: {platform, urn}}) {
  if (platform === null || urn === null) {
    throw new Error('Incomplete message: missing task platform or task urn.');
  }

  return getPluginEndpoint(platform, 'DropRunner')
    .then(endpoint => dropTaskRunner(endpoint, urn))
  ;
}
