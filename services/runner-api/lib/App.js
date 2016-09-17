const express = require('express');
const morgan = require('morgan');
const Docker = require('dockerode');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const crypto = require('crypto');
const fs = require('fs');
const mkdir = Promise.promisify(fs.mkdir);
const chown = Promise.promisify(fs.chown);

import Runner from './Runner';

/**
 * @api {post} /runner/:buildUrn/:analyzer/start Start a new run
 * @apiName StartRun
 * @apiGroup runner-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn   Build URN
 * @apiParam {String} analyzer   Either <code>php-cs-fixer</code> or <code>phpqa</code>
 * @apiParam {String} repoUrl    URL of the repository to clone
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:30
 *     analyzer = php-cs-fixer
 *     repoUrl = https://github.com/KnpLabs/Gaufrette
 * @apiError (400) UrnNotValid          The build URN is not valid
 * @apiError (400) MissingRepoUrl       <code>repoUrl</code> is missing
 * @apiError (409) RunnerAlreadyCreated
 */
export default class {
  constructor(config) {
    this._config = config;

    this.boot();
  }

  boot() {
    this._docker = Promise.promisifyAll(new Docker(this._config.docker));
    this._runner = new Runner(this._docker, {labelPrefix: this._config.labelPrefix});

    this._express = express();
    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: false }));
    this._express.post('/runner/:buildUrn/:analyzer/start', this.handleRequest.bind(this));
    this._express.param('buildUrn', (req, res, next, urn) => {
      if (/^urn:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+:\d+/.test(urn)) {
        next();
        return;
      }

      res.status(400).json({error: 'UrnNotValid'});
    });
    this._express.use((err, req, res, next) => { // 'next' mandatory, must not remove
      logger.error(err.name, err.message);

      res.status(500).end();
    });
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Application started on port ${this._config.httpPort}.`);
    });
  }

  handleRequest(req, res, next) {
    const buildUrn = req.params.buildUrn;
    const matches = /^urn:(gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+:\d+)$/.exec(buildUrn);
    const analyzer = req.params.analyzer;
    const repoUrl = req.body.repoUrl || null;

    if (matches === null) {
      res.status(400).json({ error: 'UrnNotValid' });
      return;
    }
    if (repoUrl === null) {
      res.status(400).json({ error: 'MissingRepoUrl' });
      return;
    }

    const digest = crypto
      .createHash('sha1')
      .update(matches[1]+'_'+analyzer)
      .digest('hex')
    ;
    const artifactDirectory = `${this._config.tmpDir}/${digest}`;

    this
      .createArtifactDirectory(artifactDirectory)
      .then(() => {
        return this
          ._runner
          .createContainer(digest, analyzer, repoUrl, artifactDirectory, {
            buildUrn: buildUrn,
            analyzer: analyzer,
            repoUrl: repoUrl
          })
        ;
      })
      .then((container) => {
        return this._runner.startContainer(container);
      })
      .then(() => {
        res.sendStatus(200).end();
      })
      .catch((err) => {
        // Docker daemon may return '409 Conflict'
        if ('statusCode' in err && err.statusCode == 409) {
          res.status(409).json({ error: 'RunnerAlreadyCreated'});
          return;
        }

        next(err);
      })
    ;
  }

  createArtifactDirectory(artifactDirectory) {
    return mkdir(artifactDirectory).then(() => {
      return chown(artifactDirectory, 1000, 1000);
    });
  }
}
