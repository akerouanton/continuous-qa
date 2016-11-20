const _ = require('underscore');
const logger = require('tracer').colorConsole();

import {fetchBuild, runBuild, changeBuildState} from '../service/BuildGateway';
import {fetchMatchingPipeline} from '../service/PipelineGateway';
import {enrichPipeline} from '../service/PluginGateway';
import {PipelineNotFoundError} from '../errors';

export function onBuildCreated({build: {urn: buildUrn = null}}) {
  if (buildUrn === null) {
    throw new Error('Incomplete message: missing urn.');
  }

  return fetchBuild(buildUrn)
    .then(fetchMatchingPipeline)
    .then(enrichPipeline)
    .then((pipeline) => runBuild(buildUrn, pipeline.stages))
    .catch((err) => {
      if (err instanceof PipelineNotFoundError) {
        return changeBuildState(buildUrn, 'failed');
      }

      logger.error(err);
    })
  ;
}
