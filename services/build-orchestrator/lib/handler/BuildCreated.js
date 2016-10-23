const _ = require('underscore');

import {fetchBuild, runBuild} from '../service/BuildGateway';
import {fetchMatchingPipeline} from '../service/PipelineGateway';

export default function onBuildCreated({urn: buildUrn = null}) {
  if (buildUrn === null) {
    throw new Error('Incomplete message: missing urn.');
  }

  return fetchBuild(buildUrn)
    .then((build) => fetchMatchingPipeline(build.projectUrn, build.branch))
    .then((pipeline) => {
      return runBuild(buildUrn, _.map(pipeline.stages, stage => stage.runners));
    })
  ;
}
