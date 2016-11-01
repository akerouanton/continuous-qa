const logger = require('tracer').colorConsole();

import {updateTaskState} from '../service/BuildGateway';
import {startTaskRunner} from '../service/RunnerGateway';
import {getPluginEndpoint} from '../service/PluginGateway';

export function onTaskQueued({build, stage, task}) {
  const {urn: buildUrn = null} = build;
  const {position: stageId = null} = stage;
  const {name: taskName = null, runner = null, platform = null} = task;

  if (buildUrn === null || stageId === null || taskName === null || platform === null || runner === null) {
    logger.debug({buildUrn, stageId, platform, runner});
    throw new Error('Incomplete message: either build urn, stage position, task runner or task platform were missing.');
  }

  return getPluginEndpoint(task.platform, 'StartRunner')
    .then((endpoint) => {
      const metadata = {buildUrn, stageId, taskName};
      const envVars = {REPO_URL: build.repoUrl, GIT_REF: build.ref};

      return startTaskRunner(endpoint, task.urn, runner, metadata, envVars);
    })
    .then(() => updateTaskState({buildUrn, taskName, stageId, state: 'running'}))
  ;
}
