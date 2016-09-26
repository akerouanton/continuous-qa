const express = require('express');
const morgan = require('morgan');
const Docker = require('dockerode-promise');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');

import Runner from './service/Runner';
import ArtifactManager from './service/ArtifactManager';
import StartController from './controller/StartController';
import DropController from './controller/DropController';

export default class App {
  constructor(config) {
    const docker = new Docker({socketPath: config.docker.socketPath});

    this._runner = new Runner(docker, {labelPrefix: config.labelPrefix});
    this._artifactManager = new ArtifactManager(config.tmpDir);
    this._express = express();
    this._config = config;

    this.boot();
  }

  boot() {
    const startController = new StartController(this._runner, this._artifactManager);
    const dropController = new DropController(this._runner, this._artifactManager);

    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: false }));

    this._express.post('/runner/:buildUrn/:analyzer/start', startController.handleRequest.bind(startController));
    this._express.post('/runner/:buildUrn/:analyzer/drop', dropController.handleRequest.bind(dropController));
    this._express.param('buildUrn', this.validateBuildUrn);
    this._express.use(this.errorHandler);
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Application started on port ${this._config.httpPort}.`);
    });
  }

  validateBuildUrn(req, res, next, urn) {
    if (/^urn:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+:\d+$/.test(urn)) {
      next();
      return;
    }

    res.status(400).json({error: 'UrnNotValid'});
  }

  errorHandler(err, req, res, next) { // 'next' mandatory, must not be removed
    let log = `${err.name}: ${err.message}`;
    if (typeof err.stack !== 'undefined') {
      log = err;
    }

    logger.error(log);

    res.status(500).end();
  }
}
