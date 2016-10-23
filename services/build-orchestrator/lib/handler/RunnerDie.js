const _ = require('underscore');
const config  = require('config');
const logger = require('tracer').colorConsole();
const assert = require('assert');

import {updateRunnerState} from '../service/BuildGateway';

export default function onRunnerDie({metadata}) {
  const runner = {exitCode: metadata.exitCode || null};
  ['buildUrn', 'stage', 'runnerType']
    .forEach(key => runner[key] = metadata[`${config.labelPrefix}.${key}`] || null)

  try {
    _.mapObject(runner, data => assert(data));
  } catch (err) {
    logger.debug(err, event, runner);
    return Promise.reject(err);
  }

  runner.state = parseInt(runner.exitCode) === 0 ? 'succeeded' : 'failed';
  return updateRunnerState(runner);
}
