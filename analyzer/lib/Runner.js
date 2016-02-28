const Promise  = require('bluebird');
const Docker   = require('dockerode');
const fs       = require('fs');
const logger   = require('../logger');

module.exports = function Runner(config) {
  const docker = Promise.promisifyAll(new Docker(config));

  function normalizeContainerName(name) {
    return name.replace(new RegExp("[^a-zA-Z0-9_]", "g"), "_").toLowerCase();
  }

  function normalizeLabels(metadata) {
    const labels = {};

    for (let label in metadata) {
      labels[normalizeLabelName(label)] = metadata[label];
    }

    return labels;
  }

  function normalizeLabelName(label) {
    return `com.continuousqa.${label}`;
  }

  this.createContainer = (name, image, cmd, metadata) => {
    name = normalizeContainerName(name);

    return Promise
      .promisify(fs.mkdir)(`/tmp/${name}`)
      .then(() => {
        return docker.createContainerAsync({
          name: name,
          Image: `continuousqa/${image}`,
          Cmd: cmd,
          HostConfig: {
            Binds: [`/tmp/${name}:/build`]
          },
          Labels: normalizeLabels(metadata)
        });
      })
  };

  this.fetchReports = (name) => {
    name = normalizeContainerName(name);

    return Promise
      .promisify(fs.readdir)(`/tmp/${name}`)
      .then((files) => {
        if (files === null) {
          return [];
        }

        const hashtable = new Map();

        for (let i in files) {
          let filename = files[i];

          hashtable.set(
            filename,
            Promise
              .promisify(fs.readFile)(`/tmp/${name}/${filename}`)
              .then((file) => { return file.toString(); })
          );
        }

        return Promise
          .all(hashtable.values())
          .then(() => { return hashtable; })
        ;
      })
      .catch(logger.error)
    ;
  };

  this.cleanContainer = (containerId) => {
    logger.log(`Cleaning container ${containerId}.`);

    return Promise
      .promisifyAll(docker.getContainer(containerId))
      .removeAsync({'v': 1})
    ;
  };
};
