const logger = require('tracer').colorConsole();

import {fetchBuild, updateRunnerState} from '../service/BuildGateway';
import {startRunner} from '../service/RunnerGateway';

export default function BuildRunnerQueued({buildUrn = null, stage = null, runnerType = null}) {
  if (buildUrn === null || stage === null || runnerType === null) {
    throw new Error('Incomplete message: either build urn, stage or runner type were missing.');
  }

  return fetchBuild(buildUrn)
    .then((build) => {
      if (build.stages[stage] === undefined) {
        throw new Error('Stage not found.');
      }
      const runner = build.stages[stage].runners[runnerType];
      if (runner === undefined) {
        throw new Error('Runner not found.');
      }
      if (runner.state !== 'queued') {
        throw new Error('Runner should have "queued" state.');
      }

      const metadata = {buildUrn, stage};
      const envVars = {REPO_URL: build.repoUrl, GIT_REF: build.ref};

      return startRunner(runner.urn, runnerType, metadata, envVars);
    })
    .then(() => updateRunnerState({buildUrn, runnerType, stage, state: 'running'}))
  ;
}
