const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const Grant = require('grant-express');
const morgan = require('morgan');
const logger = require('tracer').colorConsole();
const config = require('config');

import errorHandler from './errorHandler';
import router from './router';

export default class {
  constructor() {
    this._express = express();
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongo_uri);

    this._express.use(morgan('combined'));
    this._express.use(session({
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
    }));
    this._express.use(new Grant(config.oauth));
    this._express.use(router());
    this._express.use(errorHandler());
  }

  run() {
    this._express.listen(config.http_port, () => {
      logger.info(`Start listening on port ${config.http_port}.`);
    });
  }
}
