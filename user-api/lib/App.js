const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const Grant = require('grant-express');
const morgan = require('morgan');
const amqp = require('amqp');

import ConnectedController from './ConnectedController';
import EventDispatcher from './EventDispatcher';
import ProfileController from './ProfileController';
import UserListener from './UserListener';

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
  }

  run() {
    const connection = amqp.createConnection(this._config.amqp);

    this._express.listen(this._config.http_port, () => {
      console.log(`Start listening on port ${this._config.http_port}.`);
    });

    connection.on('ready', () => {
      const exchange = connection.exchange('amq.direct');
      exchange.on('open', () => {
        console.log('Exchange ready.');
        new UserListener(exchange);
      });
    });
  }
}
