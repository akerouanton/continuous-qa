const Promise = require('bluebird');
const os = require('os');

import logger from './Logger';

export default class Runner {
  constructor(docker, config) {
    this._docker = docker;
    this._config = config;
  }

  static normalizeContainerName(name) {
    return name
      .replace(new RegExp("[^a-zA-Z0-9]", "g"), "")
      .replace('/', '_')
      .toLowerCase()
    ;
  }

  normalizeLabels(labels) {
    const normalized = {};

    for (let label in labels) {
      normalized[`${this._config.labelPrefix}.${label}`] = labels[label];
    }

    return normalized;
  }

  createContainer(name, image, repoUrl, mountPoint, metadata) {
    const normalizedName = Runner.normalizeContainerName(name);
    metadata.mountPoint = mountPoint;
    metadata.runner = 'true';
    metadata.containerName = name;

    logger.info('Creating new container for ' + name + '.', {
      name: name,
      normalizedName: normalizedName,
      mountPoint: mountPoint
    });

    return this._docker
      .createContainerAsync({
        name: normalizedName,
        Image: `continuousqa/${image}`,
        Env: [
          'REPO_URL=' + repoUrl
        ],
        Labels: this.normalizeLabels(metadata),
        HostConfig: {
          Binds: [
            mountPoint + ':/artifacts/'
          ]
        }
      })
    ;
  }

  startContainer(container) {
    return container.startAsync();
  }

  stopContainer(containerName) {
    return Promise
      .promisifyAll(this._docker.getContainer(containerName))
      .stopAsync()
    ;
  }
}
