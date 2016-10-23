const express = require('express');
const morgan = require('morgan');
const Docker = require('dockerode-promise');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const config = require('config');

import Runner from './service/Runner';
import router from './Router';

export default class App {
  constructor() {
    const docker = new Docker({socketPath: config.docker_socket});

    this._runner = new Runner(docker);
    this._express = express();

    this.boot();
  }

  boot() {
    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: true }));
    this._express.use(router(this._runner));
    this._express.use((err, req, res, next) => {
      let log = `${err.name}: ${err.message}`;
      if (typeof err.stack !== 'undefined') {
        log = err;
      }

      logger.error(log);

      res.status(500).end();
    });
  }

  run() {
    this._express.listen(config.http_port, () => {
      logger.info(`Application started on port ${config.http_port}.`);
    });
  }
}
