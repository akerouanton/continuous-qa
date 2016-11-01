const _ = require('underscore');
const config  = require('config');
const logger = require('tracer').colorConsole();
const assert = require('assert');

import {updateTaskState} from '../service/BuildGateway';

export function onRunnerDie({metadata}) {
  const task = {
    buildUrn: metadata[`${config.labelPrefix}.buildUrn`] || null,
    stageId: metadata[`${config.labelPrefix}.stageId`] || null,
    taskName: metadata[`${config.labelPrefix}.taskName`] || null,
    state: parseInt(metadata.exitCode) === 0 ? 'succeeded' : 'failed'
  };

  try {
    _.mapObject(task, data => assert(data));
  } catch (err) {
    logger.debug(err, metadata, task);
    return Promise.reject(err);
  }

  return updateTaskState(task);
}
