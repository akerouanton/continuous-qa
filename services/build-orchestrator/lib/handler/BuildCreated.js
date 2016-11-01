const _ = require('underscore');
const logger = require('tracer').colorConsole();

import {fetchBuild, runBuild} from '../service/BuildGateway';
import {fetchMatchingPipeline} from '../service/PipelineGateway';
import {enrichPipeline} from '../service/PluginGateway';

export function onBuildCreated({build: {urn: buildUrn = null}}) {
  if (buildUrn === null) {
    throw new Error('Incomplete message: missing urn.');
  }

  return fetchBuild(buildUrn)
    .then((build) => fetchMatchingPipeline(build.projectUrn, build.branch))
    .then((pipeline) => { logger.debug(pipeline); return pipeline; })
    .then((pipeline) => enrichPipeline(pipeline))
    .then((pipeline) => runBuild(buildUrn, pipeline.stages))
  ;
}
