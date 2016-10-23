const express = require('express');
const morgan = require('morgan');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const config = require('config');
const mongoose = require('mongoose');

import router from './router';
import errorHandler from './errorHandler';

export default class App {
  constructor() {
    this._express = express();

    mongoose.Promise = global.Promise;
    mongoose.connect(`${config.mongo.uri}/${config.mongo.db}`);

    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: true }));
    this._express.use(router());
    this._express.use(errorHandler());
  }

  run() {
    this._express.listen(config.httpPort, () => {
      logger.info(`Start listening on port ${config.httpPort}.`);
    })
  }
}
