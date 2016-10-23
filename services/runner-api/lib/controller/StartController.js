const Promise = require('promise');
const logger = require('tracer').colorConsole();

import {RunnerAlreadyExistsError, RunnerTypeNotSupportedError} from '../service/RunnerError';

/**
 * @api {put} /runner/:runnerUrn Start a new runner
 * @apiName StartRunner
 * @apiGroup runner-api
 * @apiVersion 0.1.0
 * @apiParam {String}   runnerUrn
 * @apiParam {String}   runnerType
 * @apiParam {Object[]} metadata
 * @apiParam {Object[]} envVars
 * @apiParamExample Parameters Example
 *     runnerUrn = urn:gh:knplabs/gaufrette:30:1:php-cs-fixer
 *     runnerType = php-cs-fixer
 *     metadata[buildUrn] = urn:gh:knplabs/gaufrette:30
 *     envVars[REPO_URL] = https://github.com/KnpLabs/Gaufrette
 *     envVars[GIT_REF] = master
 * @apiError (400) UrnNotValid          The runner URN is not valid
 * @apiError (400) MissingRunnerType
 * @apiError (404) RunnerTypeNotSupported
 * @apiError (409) RunnerAlreadyCreated
 */
export default class {
  constructor(runner) {
    this._runner = runner;
  }

  handleRequest(req, res, next) {
    const runnerUrn = req.params.runnerUrn;
    const runnerType = req.body.runnerType || null;
    const metadata = req.body.metadata || {};
    const envVars = req.body.envVars || {};

    if (runnerType === null) {
      return res.status(400).json({error: 'MissingRunnerType'});
    }

    this
      ._runner
      .startRunner(runnerUrn, runnerType, metadata, envVars)
      .then(() => {
        res.sendStatus(201).end();
      })
      .catch((err) => {
        if (err instanceof RunnerTypeNotSupportedError) {
          res.status(404).json({ error: 'RunnerTypeNotSupported'});
          return Promise.reject();
        }
        if (err instanceof RunnerAlreadyExistsError) {
          res.status(409).json({ error: 'RunnerAlreadyCreated'});
          return Promise.reject();
        }

        next(err);
      })
    ;
  }
}
