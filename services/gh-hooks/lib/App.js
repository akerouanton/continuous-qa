const express = require('express');
const morgan = require('morgan');
const logger = require('winston');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const Promise = require('promise');
const post = Promise.denodeify(require('request').post);

import Controller from './Controller';

export default class App {
  constructor(config) {
    this._emitter = new EventEmitter();
    this._config = config;
    this._express = express();

    this.boot();
  }

  boot() {
    const controller = new Controller(this._emitter, this._config.secret);

    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({extended: false}));
    this._express.use(controller.checkRequestSignature.bind(controller));

    this._express.post('/hook/gh', controller.handleRequest.bind(controller));
    this._express.use(App.errorHandler);

    this._emitter.on('pull_request', (event) => {
      if (event.action !== 'opened' && event.action !== 'synchronize') {
        return;
      }

      const repoName = event.pull_request.head.repo.full_name;
      const repoUrn = `urn:gh:${repoName.toLowerCase()}`;
      const repoUrl = event.pull_request.head.repo.html_url;
      const reference = event.pull_request.head.ref;

      const url = `${this._config.buildEndpoint}/${encodeURIComponent(repoUrn)}/new`;
      post({url: url, form: {repoUrl: repoUrl, reference: reference}})
        .then((response) => {
          if (response.statusCode !== 200) {
            logger.error(
              'An error occurred while creating a new build.',
              {url: url, repoUrl: repoUrl, reference: reference, statusCode: response.statusCode, body: response.body}
            );
            return;
          }

          logger.debug(`New build created for "${repoName}:${reference}".`);
        })
        .catch((err) => {
          logger.error(err);
          return Promise.resolve();
        });
    });
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Server started on port ${this._config.httpPort}.`);
    });
  }

  static errorHandler(err, req, res, next) {
    logger.error(err);

    res.status(500).end();
  }
}
