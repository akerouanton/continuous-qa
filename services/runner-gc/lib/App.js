const EventEmitter = require('events');
const amqp = require('amqp');
const logger = require('tracer').colorConsole();
const Promise = require('promise');
const request = require('request');
const patch = Promise.denodeify(request.patch);
const put = Promise.denodeify(request.put);
const post = Promise.denodeify(request.post);
const fs = require('fs');
const readdir = Promise.denodeify(fs.readdir);
const assert = require('assert');

import Consumer from './Consumer';
import Runner from './model/Runner';

export default class {
  constructor(config) {
    this._emitter = new EventEmitter();
    this._consumer = new Consumer(this._emitter, config.amqp);
    this._config = config;

    this._emitter.on('runnerDie', this.onRunnerDie.bind(this));
  }

  run() {
    this._consumer.connect();
  }

  onRunnerDie(event) {
    const data = {
      name: event.metadata[`${this._config.labelPrefix}.runnerName`] || null,
      buildUrn: event.metadata[`${this._config.labelPrefix}.buildUrn`] || null,
      analyzer: event.metadata[`${this._config.labelPrefix}.analyzer`] || null,
      mountPoint: event.metadata[`${this._config.labelPrefix}.mountPoint`] || null,
      exitCode: event.metadata['exitCode'] || null
    };

    try {
      for (let key in data) {
        assert(data[key]);
      }
    } catch (err) {
      this._emitter.emit('error', {
        message: 'Message incomplete.',
        event: event
      });

      return;
    }

    const runner = new Runner(data);
    this
      .updateBuildStatus(runner)
      .then(() => {
        return this.uploadArtifacts(runner);
      })
      .then(() => {
        return this.dropRunner(runner);
      })
      .catch(err => {
        this._emitter.emit('error', err);
        return Promise.reject();
      })
      .then(() => {
        this._emitter.emit('runnerCleaned');
      })
    ;
  }

  updateBuildStatus(runner) {
    const buildUrn = encodeURIComponent(runner.buildUrn);
    const url = `${this._config.buildEndpoint}/${buildUrn}/${runner.analyzer}`;
    const state = parseInt(runner.exitCode) === 0 ? 'succeeded' : 'failed';

    logger.info('Updating build status.', { buildUrn: runner.buildUrn, url: url, state: state });
    return patch({url: url, form: { state: state }}).then(response => {
      if (response.statusCode !== 200) {
        throw new Error(
          'An error occured while updating build status.',
          { buildUrn: runner.buildUrn, url: url, state: state, statusCode: response.statusCode, body: response.body }
        );
      }

      logger.debug('Build status updated.', { buildUrn: runner.buildUrn });
    });
  }

  uploadArtifacts(runner) {
    const bucket = encodeURIComponent(runner.buildUrn + ':' + runner.analyzer);
    var artifactDirectory = `${this._config.artifactsTmpDir}/${runner.name}`;

    logger.info('Looking for artifacts at ' + artifactDirectory);

    return readdir(artifactDirectory)
      .then(files => {
        const promises = [];

        logger.info('Sending artifacts.', {bucket: bucket, artifacts: files});

        for (let file of files) {
          const url = `${this._config.artifactEndpoint}/${bucket}/${file}`;
          const path = `${artifactDirectory}/${file}`;

          var artifact = fs.createReadStream(path);
          promises.push(
            put({url: url, formData: {artifact: artifact}}).then((response) => {
              if (response.statusCode !== 200) {
                throw new Error('An error occurred while uploading artifacts.');
              }
            })
          );
        }

        return Promise
          .all(promises)
          .then(() => {
            logger.debug('Artifacts sent.', {bucket: bucket, artifacts: files});
          })
        ;
      })
    ;
  }

  dropRunner(runner) {
    logger.info(`Dropping runner "${runner.buildUrn}:${runner.analyzer}.`);

    const buildUrn = encodeURIComponent(runner.buildUrn);
    const url = `${this._config.runnerEndpoint}/${buildUrn}/${runner.analyzer}/drop`;

    return post({url: url}).then((response) => {
      if (response.statusCode !== 200) {
        throw new Error(
          'An error occurred while dropping runner.',
          {url: url, runner: runner}
        );
      }

      logger.debug(`Runner "${runner.buildUrn}:${runner.analyzer} dropped.`);
    });
  }
}
