import {dropRunner} from '../service/RunnerGateway';

export default function onBuildRunnerFinished({runnerUrn = null}) {
  if (runnerUrn === null) {
    throw new Error('Incomplete message: missing urn.');
  }

  return dropRunner(runner);
}
