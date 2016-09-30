const express = require('express');
const morgan = require('morgan');
const MongoClient = require('mongodb').MongoClient;

import logger from './Logger';
import ListArtifacts from './controller/ListArtifacts';
import PutArtifact from './controller/PutArtifact';
import RetrieveArtifact from './controller/RetrieveArtifact';
import BucketParamValidator from './BucketParamValidator';

export default class {
  constructor(config) {
    this._config = config;

    this.bootDatabase();
  }

  bootDatabase() {
    MongoClient
      .connect(`${this._config.mongo_uri}/${this._config.mongo_dbname}`)
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
    const collection = this._db.collection('artifacts');
    const putArtifact = new PutArtifact(collection);
    const retrieveArtifact = new RetrieveArtifact(collection);
    const listArtifacts = new ListArtifacts(collection);

    this._express = express();
    this._express.use(morgan('combined'));
    this._express.put('/artifact/:bucket/:filename', putArtifact.handle.bind(putArtifact));
    this._express.get('/artifact/:bucket/:filename', retrieveArtifact.handle.bind(retrieveArtifact));
    this._express.get('/artifacts/:bucket', listArtifacts.handle.bind(listArtifacts));
    this._express.param('bucket', BucketParamValidator);
    this._express.use((err, req, res) => {
      logger.error(err.name, err.message);

      res.sendStatus(500).end();
    });

    this._express.listen(this._config.http_port, () => {
      logger.info(`Application started on port ${this._config.http_port}.`);
    });
  }
}
