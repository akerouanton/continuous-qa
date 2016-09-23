const EventEmitter = require('events');
const amqp = require('amqp');
const logger = require('tracer').colorConsole();
const Promise = require('promise');
const request = require('request');
const post = Promise.denodeify(request.post);
const patch = Promise.denodeify(request.patch);

import Consumer from './Consumer';

export default class {
  constructor(config) {
    this._emitter = new EventEmitter();
    this._consumer = new Consumer(this._emitter, config.amqp);
    this._config = config;

    this._emitter.on('buildCreated', (event) => {
      const buildUrn = event.urn || null;
      const analyses = event.analyses || null;
      const repoUrl  = event.repoUrl || null;
      const reference = event.reference || null;

      if (buildUrn === null || analyses === null || repoUrl === null || reference === null) {
        const err = {
          message: 'Message was incomplete (either urn, analyses, repoUrl or reference were missing).',
          event: event,
          data: {
            buildUrn: buildUrn,
            analyses: analyses,
            repoUrl: repoUrl,
            reference: reference
          }
        };

        this._emitter.emit('error', err);
        return;
      }

      const promises = analyses.map((analysis) => {
        return this._startRunner(buildUrn, analysis, repoUrl, reference);
      });

      Promise
        .all(promises)
        .then(() => {
          logger.info('Runners started.', {analyses: analyses});
          this._emitter.emit('runnersStarted');
        })
        .catch((err) => {
          this._emitter.emit('error', err);
        })
      ;
    });
  }

  run() {
    this._consumer.connect();
  }

  _startRunner(buildUrn, analysis, repoUrl, reference) {
    const analyzer = analysis.analyzer;
    const url = `${this._config.runnerEndpoint}/${encodeURIComponent(buildUrn)}/${analyzer}/start`;

    return post({url: url, form: {repoUrl: repoUrl, reference: reference}})
      .then((response) => {
        if (response.statusCode !== 200) {
          throw new Error(
            'An error occurred while starting a new runner.',
            { buildUrn: buildUrn, url: url, analyzer: analyzer, statusCode: response.statusCode, body: response.body }
          );
        }

        logger.debug(`Runner for "${buildUrn}:${analyzer}" started.`);

        return this._updateBuildStatus(buildUrn, analyzer);
      })
    ;
  }

  _updateBuildStatus(buildUrn, analyzer) {
    const url = `${this._config.buildEndpoint}/${encodeURIComponent(buildUrn)}/${analyzer}`;

    logger.info('Updating analysis status.', {buildUrn: buildUrn, analyzer: analyzer, url: url});

    return patch({url: url, form: {state: 'running'}})
      .then((response) => {
        if (response.statusCode !== 200) {
          throw new Error(
            'An error occurred while updating build status.',
            { buildUrn: buildUrn, url: url, statusCode: response.statusCode, body: response.body }
          );
        }

        logger.debug('Build status updated.', {buildUrn: buildUrn, analyzer: analyzer});
      })
    ;
  }
}
