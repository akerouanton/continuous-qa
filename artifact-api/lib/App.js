const express = require('express');
const morgan = require('morgan');
const tracer = require('tracer');
const logger = tracer.colorConsole();
const MongoClient = require('mongodb').MongoClient;

import router from './Router';

export default class {
  constructor(config) {
    this._config = config;

    this.bootDatabase();
  }

  bootDatabase() {
    MongoClient
      .connect(this._config.mongo_uri)
      .then((db) => {
        logger.info('Connection to the database established.');

        this._db = db;
        this.finishBoot();
      })
      .catch((err) => {
        logger.error(`Unable to connect to the database:\n${err}`);
        logger.error('Application stopped.');

        process.exit(1);
      })
    ;
  }

  finishBoot() {
    this._express = express();
    this._express.use(morgan('combined'));
    this._express.use(router(this._db));
    this._express.use((err, req, res, next) => {
      logger.error(err.message);
      console.log(err.stack);

      res.sendStatus(500).end('An error happened!');
    });

    this._express.listen(this._config.http_port, () => {
      logger.info(`Application started on port ${this._config.http_port}.`);
    });
  }
}
