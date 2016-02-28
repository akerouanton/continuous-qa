const Promise = require('bluebird');
const logger = require('../logger');

module.exports = function Analysis(buildId, projectName, projectUrl, analyzer, runner) {
  this.containerId = null;
  const containerName     = `${projectName}_${buildId}_${analyzer}`;
  const containerMetadata = {
    "project":  projectName,
    "build_id": buildId,
    "analyzer": analyzer
  };

  const startAndWait = (container) => {
    container = Promise.promisifyAll(container);
    this.containerId = container.id;

    return container
      .startAsync()
      .then(function () { return container.waitAsync(); })
      .catch(logger.error)
    ;
  };

  const fetchAndStoreReports = () => {
    logger.log(`Persisting reports for "${analyzer}", build "${buildId}".`);

    return runner
      .fetchReports(containerName)
    ;
  };

  const clean = () => {
    const containerId = this.containerId;

    logger.log(`Cleaning container ${containerId} for analyzer "${analyzer}", build "${buildId}".`);

    return runner.cleanContainer(containerId);
  };

  this.run = () => {
    logger.log(`Starting analysis "${analyzer}" for build "${buildId}".`);

    return runner
      .createContainer(containerName, analyzer, projectUrl, containerMetadata)
      .then(startAndWait)
      .then(fetchAndStoreReports)
      .then(clean)
      .catch(logger.error)
    ;
  };
};
