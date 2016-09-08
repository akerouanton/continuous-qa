const express = require('express');
const morgan = require('morgan');
const MongoClient = require('mongodb').MongoClient;

import router from './Router';
import logger from './Logger';

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
    this._express.use('/artifacts', router(this._db.collection('artifacts')));
    this._express.use((err, req, res) => {
      logger.error(err.name, err.message);

      res.sendStatus(500).end();
    });

    this._express.listen(this._config.http_port, () => {
      logger.info(`Application started on port ${this._config.http_port}.`);
    });
  }
}
