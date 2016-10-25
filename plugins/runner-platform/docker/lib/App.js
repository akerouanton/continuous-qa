const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const logger = require('tracer').colorConsole();
const config = require('config');
const Docker = require('dockerode-promise');

import Runner from './service/Runner';
import router from './router';
import errorHandler from './errorHandler';

export default class App {
  constructor() {
    this._express = express();

    const docker = new Docker({socketPath: config.docker_socket});
    const runner = new Runner(docker);

    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: true }));
    this._express.use(router(runner));
    this._express.use(errorHandler());
  }

  run() {
    this._express.listen(config.http_port, () => {
      logger.info(`Application started on port ${config.http_port}.`);
    });
  }
}
