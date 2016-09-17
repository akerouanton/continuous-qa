const EventEmitter = require('events');
const amqp = require('amqp');
const logger = require('tracer').colorConsole();
const Promise = require('promise');
const request = require('request');
const post = Promise.denodeify(request.post);

import Consumer from './Consumer';

export default class {
  constructor(config) {
    const emitter = new EventEmitter();
    this._consumer = new Consumer(emitter, config.amqp);

    emitter.on('buildCreated', (event) => {
      const buildUrn = event.urn || null;
      const analyses = event.analyses || null;
      const repoUrl  = event.repoUrl || null;

      if (buildUrn === null || analyses === null || repoUrl === null) {
        const err = {
          message: 'Message was incomplete (either urn, analyses or repoUrl were missing)/',
          event: event,
          data: {
            buildUrn: buildUrn,
            analyses: analyses,
            repoUrl: repoUrl
          }
        };
        emitter.emit('error', err);

        return;
      }

      const promises = [];

      for (let analysis of analyses) {
        var url = config.runnerEndpoint + encodeURIComponent(buildUrn) + '/' + analysis['analyzer'] + '/start';
          promises.push(post({url: url, form: {repoUrl: repoUrl}}));
      }

      Promise
        .all(promises)
        .then(() => {
          logger.info('Runners created.', {analyses: analyses});
          emitter.emit('runnersCreated');
        })
        .catch((err) => {
          emitter.emit('error', err);
        })
      ;
    });
  }

  run() {
    this._consumer.connect();
  }
}
