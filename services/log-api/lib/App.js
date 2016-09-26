const express = require('express');
const morgan = require('morgan');
const logger = require('tracer').colorConsole();
const MongoClient = require('mongodb').MongoClient;

import GetLogsController from './controller/GetLogs';
import LogRepository from './service/LogRepository';

export default class App {
  constructor(config) {
    this._config = config;
    this._express = express();

    this._bootDatabase();
  }

  _bootDatabase() {
    MongoClient
      .connect(this._config.mongoUri)
      .then((db) => {
        logger.info('Connection to the database established.');

        this._db = db;
        this._finishBoot();
      })
      .catch((err) => {
        logger.error('Unable to connect to the database.', err);

        process.exit(1);
      })
    ;
  }

  _finishBoot() {
    const repository = new LogRepository(this._db.collection('logs'));
    const controller = new GetLogsController(repository);

    this._express.use(morgan('combined'));
    this._express.get('/logs/:analysisUrn', controller.handleRequest.bind(controller));
    this._express.param('analysisUrn', (req, res, next, urn) => {
      if (/^urn:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+:\d+:[a-zA-Z_-]+$/.test(urn)) {
        next();
        return;
      }

      res.status(400).json({error: 'UrnNotValid'});
    });

    this._express.use((err, req, res, next) => {
      logger.error(err);
      res.status(500).end();
    });

    this._express.listen(this._config.httpPort, () => {
      logger.info(`Start listening on port ${this._config.httpPort}.`);
    });
  }
}
