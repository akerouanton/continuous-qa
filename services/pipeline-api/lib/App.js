const express = require('express');
const logger = require('tracer').colorConsole();
const mongoose = require('mongoose');
const morgan = require('morgan');

import router from './Router';

export default class App {
  constructor(config) {
    this._config = config;
    this._express = express();

    this._boot();
  }

  _boot() {
    mongoose.Promise = global.Promise;
    mongoose.connect(`${this._config.mongo.uri}/${this._config.mongo.db}`);

    this._express.use(morgan('combined'));
    this._express.use(router(this._repository));
    this._express.use((err, req, res, next) => {
      logger.error(err);
      res.status(500).end();
    });
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Start listening on port ${this._config.httpPort}.`);
    });
  }
}
