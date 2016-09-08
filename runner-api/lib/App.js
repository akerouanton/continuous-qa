const express = require('express');
const morgan = require('morgan');
const Docker = require('dockerode');
const logger = require('tracer').colorConsole();
const bodyParser = require('body-parser');
const Promise = require('bluebird');

import Runner from './Runner';

/**
 * @api {put} /runner/:projectUrn/:analyzer/start Start a new run
 * @apiName StartRun
 * @apiGroup runner-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParam {String} analyzer   Either <code>php-cs-fixer</code> or <code>phpqa</code>
 * @apiParam {String} repoUrl    URL of the repository to clone
 * @apiParam {String} buildId    ID of the build
 * @apiParamExample Request Example:
 *     projectUrn = urn:gh:knplabs/gaufrette
 *     analyzer = php-cs-fixer
 *     repoUrl = https://github.com/KnpLabs/Gaufrette
 *     buildId = 12345678-1234-5678-1234-567812345678
 * @apiError (400) UrnNotValid          The project URN is not valid
 * @apiError (400) MissingRepoUrl       <code>repoUrl</code> is missing
 * @apiError (400) MissingBuildId       <code>buildId</code> is missing
 * @apiError (409) RunnerAlreadyCreated
 */
export default class {
  constructor(config) {
    this._config = config;

    this.boot();
  }

  boot() {
    this._docker = Promise.promisifyAll(new Docker(this._config.docker));
    this._runner = new Runner(this._docker);

    this._express = express();
    this._express.use(morgan('combined'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: false }));
    this._express.put('/runner/:projectUrn/:analyzer/start', this.handleRequest.bind(this));
    this._express.use((err, req, res) => {
      logger.error(err.name, err.message);

      res.sendStatus(500).end();
    });
  }

  run() {
    this._express.listen(this._config.httpPort, () => {
      logger.info(`Application started on port ${this._config.httpPort}.`);
    });
  }

  handleRequest(req, res, next) {
    const matches = /^urn:gh:([a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+)$/.exec(req.params.projectUrn);
    const analyzer = req.params.analyzer;
    const repoUrl = req.body.repoUrl || null;
    const buildId = req.body.buildId || null;

    if (matches === null) {
      res.status(400).json({ error: 'UrnNotValid' });
      return;
    }
    if (repoUrl === null) {
      res.status(400).json({ error: 'MissingRepoUrl' });
      return;
    }
    if (buildId === null) {
      res.status(400).json({ error: 'MissingBuildId' });
      return;
    }

    const projectName = matches[1];
    this._runner
      .createContainer(projectName, analyzer, repoUrl, {
        project: projectName,
        buildId: buildId,
        analyzer: analyzer,
        repoUrl: repoUrl
      })
      .then(this._runner.startContainer)
      .then(() => {
        res.sendStatus(200).end();
      })
      .catch((err) => {
        if ('statusCode' in err && err.statusCode == 409) {
          res.status(409).json({ error: 'RunnerAlreadyCreated'});
          return;
        }

        next(err);
      })
    ;
  }
}
