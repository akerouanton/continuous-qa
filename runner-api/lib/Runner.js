const Promise = require('bluebird');

import logger from './Logger';

export default class Runner {
  constructor(docker) {
    this._docker = docker;
  }

  static normalizeContainerName(name) {
    return name
      .replace(new RegExp("[^a-zA-Z0-9_]", "g"), "")
      .replace('/', '_')
      .toLowerCase()
    ;
  }

  static normalizeLabels(labels) {
    const normalized = {};

    for (let label in labels) {
      normalized[`com.continuousqa.${label}`] = labels[label];
    }

    return normalized;
  }

  createContainer(name, image, repoUrl, metadata) {
    const normalizedName = Runner.normalizeContainerName(name);

    return this._docker
      .createContainerAsync({
        name: normalizedName,
        Image: `continuousqa/${image}`,
        Env: [
          'REPO_URL=' + repoUrl
        ],
        Labels: Runner.normalizeLabels(metadata)
      })
    ;
  }

  startContainer(container) {
    return Promise
      .promisifyAll(container)
      .startAsync()
    ;
  }
}
