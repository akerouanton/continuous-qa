const Promise = require('bluebird');
const os = require('os');
const crypto = require('crypto');

import logger from '../Logger';

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
      normalized[`${this._config.labelPrefix}.${label}`] = labels[label];
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
    ;
  }

  stopRunner(buildUrn, analyzer) {
    const name = Runner.normalizeRunnerName(buildUrn, analyzer);
    logger.info(`Stopping container "${name}" (runner "${buildUrn}:${analyzer}").`);

    var container = this
      ._docker
      .getContainer(name);

    return container
      .stop()
      .then((response) => {
        console.log(response);
        if (response.statusCode !== 204) {
          throw new Error('Unable to stop runner.', {
            containerName: name,
            statusCode: response.statusCode,
            body: response.body
          });
        }

        logger.debug(`Container "${name}" (runner "${buildUrn}:${analyzer}") stopped.`);
      }, (err) => {
        if (err.statusCode === 304) {
          logger.debug(`Container "${name}" (runner "${buildUrn}:${analyzer}") already stopped.`);

          return Promise.resolve(container);
        }

        return Promise.reject(err);
      })
    ;
  }

  dropRunner(buildUrn, analyzer) {
    const name = Runner.normalizeRunnerName(buildUrn, analyzer);

    return this
      .stopRunner(buildUrn, analyzer)
      .then(() => {
        logger.info(`Dropping container "${name}" (runner "${buildUrn}:${analyzer}").`);

        return this._docker.getContainer(name).remove({v: true, force: true});
      })
      .then(() => {
        logger.debug(`Container "${name}" (runner "${buildUrn}:${analyzer}") dropped.`);

        return Promise.resolve();
      })
    ;
  }
}
