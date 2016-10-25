const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const Grant = require('grant-express');
const morgan = require('morgan');
const logger = require('tracer').colorConsole();

import ConnectedController from './controller/ConnectedController';
import ProfileController from './controller/ProfileController';
import DisconnectController from './controller/DisconnectController';

/**
 * @api {get} /connect/github Connect via Github
 * @apiName GithubConnect
 * @apiGroup user-api
 * @apiVersion 0.1.0
 */
export default class {
  constructor(config) {
    this._config  = config;
    this._express = express();

    this.configure();
    this.bindRoutes();
  }

  configure() {
    mongoose.connect(this._config.mongo_uri);

    this._express.use(morgan('combined'));
    this._express.use(session({
      secret: this._config.session.secret,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
    }));
    this._express.use(new Grant(this._config.oauth));
  }

  bindRoutes() {
    this._express.get('/connected', ConnectedController.handle);
    this._express.get('/profile', ProfileController.handle);
    this._express.get('/disconnect', DisconnectController.handle);

    this._express.use((err, req, res) => {
      logger.error(err.name, err.message);

      res.sendStatus(500).end();
    });
  }

  run() {
    this._express.listen(this._config.http_port, () => {
      console.log(`Start listening on port ${this._config.http_port}.`);
    });
  }
}
