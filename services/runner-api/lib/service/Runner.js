const Promise = require('bluebird');
const os = require('os');
const crypto = require('crypto');

import logger from '../Logger';
import {RunnerError, RunnerAlreadyExistsError, RunnerNotFoundError, AnalyzerNotSupportedError} from './RunnerError';

export default class Runner {
  constructor(docker, config) {
    this._docker = docker;
    this._config = config;
  }

  static normalizeRunnerName(buildUrn, analyzer) {
    const matches = /^urn:(gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+:\d+)$/.exec(buildUrn);

    return crypto
      .createHash('sha1')
      .update(`${matches[1]}_${analyzer}`)
      .digest('hex')
    ;
  }

  normalizeLabels(labels) {
    const normalized = {};

    for (let label in labels) {
      normalized[`${this._config.label_prefix}.${label}`] = labels[label];
    }

    return normalized;
  }

  startRunner(buildUrn, analyzer, repoUrl, reference, mountPoint, metadata = {}) {
    const normalizedName = Runner.normalizeRunnerName(buildUrn, analyzer);
    metadata.buildUrn = buildUrn;
    metadata.analyzer = analyzer;
    metadata.repoUrl = repoUrl;
    metadata.reference = reference;
    metadata.mountPoint = mountPoint;
    metadata.runnerName = normalizedName;
    metadata.runner = 'true';

    logger.info(`Creating container "${normalizedName}" (runner "${buildUrn}:${analyzer}").`, {
      mountPoint: mountPoint
    });

    return this._docker
      .createContainer({
        name: normalizedName,
        Image: `continuousqa/${analyzer}`,
        Env: [
          `REPO_URL=${repoUrl}`,
          `GIT_REF=${reference}`
        ],
        Labels: this.normalizeLabels(metadata),
        HostConfig: {
          Binds: [
            mountPoint + ':/artifacts/',
            '/var/run/docker.sock:/var/run/docker.sock'
          ]
        }
      })
      .then((container) => {
        logger.debug(`Container "${normalizedName}" (runner "${buildUrn}:${analyzer}") created.`);

        return container.start();
      })
      .catch((err) => {
        // Docker daemon may return '404 no such container' / '409 Conflict'
        if ('statusCode' in err && err.statusCode == 404) {
          throw new AnalyzerNotSupportedError(analyzer, err);
        } else if ('statusCode' in err && err.statusCode == 409) {
          throw new RunnerAlreadyExistsError(normalizedName, buildUrn, analyzer, err);
        }

        throw new RunnerError(
          `An error happened while starting runner "${normalizedName}", for "${buildUrn}:${analyzer}".`,
          err
        );
      })
    ;
  }

  stopRunner(buildUrn, analyzer) {
    const name = Runner.normalizeRunnerName(buildUrn, analyzer);
    const container = this._docker.getContainer(name);
    logger.info(`Stopping container "${name}" (runner "${buildUrn}:${analyzer}").`);

    return container
      .stop({ t: 1 })
      .then(() => {
        logger.debug(`Container "${name}" (runner "${buildUrn}:${analyzer}") stopped.`);
        return container;
      }, (err) => {
        if ('statusCode' in err && err.statusCode === 304) {
          logger.debug(`Container "${name}" (runner "${buildUrn}:${analyzer}") already stopped.`);
          return Promise.resolve(container);
        } else if ('statusCode' in err && err.statusCode === 404) {
          throw new RunnerNotFoundError(buildUrn, analyzer, err);
        }

        throw new RunnerError(`An error happened while stopping runner "${name}", for "${buildUrn}:${analyzer}".`, err);
      })
    ;
  }

  dropRunner(buildUrn, analyzer) {
    const name = Runner.normalizeRunnerName(buildUrn, analyzer);

    return this
      .stopRunner(buildUrn, analyzer)
      .then((container) => {
        logger.info(`Dropping container "${name}" (runner "${buildUrn}:${analyzer}").`);

        return container.remove({v: true, force: true});
      })
      .then(() => {
        logger.debug(`Container "${name}" (runner "${buildUrn}:${analyzer}") dropped.`);
      })
      .catch((err) => {
        if (err instanceof RunnerError) {
          throw err;
        }

        throw new RunnerError(`An error happened while dropping runner "${name}", for "${buildUrn}:${analyzer}".`, err);
      })
    ;
  }
}
