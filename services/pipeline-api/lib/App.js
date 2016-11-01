const express = require('express');
const logger = require('tracer').colorConsole();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

import router from './router';
import errorHandler from './errorHandler';

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
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({extended: true}));
    this._express.use(router());
    this._express.use(errorHandler());
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Start listening on port ${this._config.httpPort}.`);
    });
  }
}
