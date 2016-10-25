const Promise = require('bluebird');
const os = require('os');
const crypto = require('crypto');
const logger = require('tracer').colorConsole();
const config = require('config');
const _ = require('underscore');

import {RunnerError, RunnerAlreadyExistsError, RunnerNotFoundError, RunnerTypeNotSupportedError} from './RunnerError';

export default class Runner {
  constructor(docker) {
    this._docker = docker;
  }

  static normalizeContainerName(runnerUrn) {
    return crypto.createHash('sha1').update(runnerUrn).digest('hex');
  }

  static normalizeEnvVars(envVars) {
    return _.map(_.pairs(envVars), (key, val) => `${key}=${val}`);
  }

  static normalizeLabels(labels) {
    const normalized = {};

    for (let label in labels) {
      normalized[`${config.label_prefix}.${label}`] = labels[label];
    }

    return normalized;
  }

  startRunner(runnerUrn, runnerType, metadata = {}, envVars = {}) {
    const normalizedName = Runner.normalizeContainerName(runnerUrn);
    metadata.runnerUrn = runnerUrn;
    metadata.runnerType = runnerType;
    metadata.runner = 'true';

    logger.info(`Creating container "${normalizedName}" (runner "${runnerUrn}", image "continuousqa/${runnerType}").`);

    return this._docker
      .createContainer({
        name: normalizedName,
        Image: `continuousqa/${runnerType}`,
        Env: Runner.normalizeEnvVars(envVars),
        Labels: Runner.normalizeLabels(metadata),
        HostConfig: {Binds: ['/var/run/docker.sock:/var/run/docker.sock']}
      })
      .then((container) => {
        logger.debug(`Container "${normalizedName}" (runner "${runnerUrn}") created.`);

        return container.start();
      })
      .catch((err) => {
        // Docker daemon may return '404 no such container' / '409 Conflict'
        if ('statusCode' in err && err.statusCode == 404) {
          throw new RunnerTypeNotSupportedError(runnerType, err);
        } else if ('statusCode' in err && err.statusCode == 409) {
          throw new RunnerAlreadyExistsError(normalizedName, runnerUrn, err);
        }

        throw new RunnerError(
          `An error happened while starting runner "${normalizedName}", for "${runnerUrn}".`,
          err
        );
      })
    ;
  }

  stopRunner(runnerUrn) {
    const name = Runner.normalizeContainerName(runnerUrn);
    const container = this._docker.getContainer(name);
    logger.info(`Stopping container "${name}" (runner "${runnerUrn}").`);

    return container
      .stop({ t: 1 })
      .then(() => {
        logger.debug(`Container "${name}" (runner "${runnerUrn}") stopped.`);
        return container;
      }, (err) => {
        if ('statusCode' in err && err.statusCode === 304) {
          logger.debug(`Container "${name}" (runner "${runnerUrn}") already stopped.`);
          return Promise.resolve(container);
        } else if ('statusCode' in err && err.statusCode === 404) {
          throw new RunnerNotFoundError(runnerUrn, err);
        }

        throw new RunnerError(`An error happened while stopping runner "${name}", for "${runnerUrn}".`, err);
      })
    ;
  }

  dropRunner(runnerUrn) {
    const name = Runner.normalizeContainerName(runnerUrn);

    return this
      .stopRunner(runnerUrn)
      .then((container) => {
        logger.info(`Dropping container "${name}" (runner "${runnerUrn}").`);

        return container.remove({v: true, force: true});
      })
      .then(() => {
        logger.debug(`Container "${name}" (runner "${runnerUrn}") dropped.`);
      })
      .catch((err) => {
        if (err instanceof RunnerError) {
          throw err;
        }

        throw new RunnerError(`An error happened while dropping runner "${name}", for "${runnerUrn}".`, err);
      })
    ;
  }
}
