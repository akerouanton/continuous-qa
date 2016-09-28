const Promise = require('promise');

import Runner from '../service/Runner';
import {RunnerNotFoundError} from '../service/RunnerError';

/**
 * @api {post} /runner/:buildUrn/:analyzer/drop Remove a runner
 * @apiName DropRunner
 * @apiGroup runner-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn   Build URN
 * @apiParam {String} analyzer   Either <code>php-cs-fixer</code> or <code>phpqa</code>
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:30
 *     analyzer = php-cs-fixer
 * @apiError (400) UrnNotValid          The build URN is not valid
 * @apiError (404) RunnerNotExists
 */
export default class {
  constructor(runner, artifactManager) {
    this._runner = runner;
    this._artifactManager = artifactManager;
  }

  handleRequest(req, res, next) {
    const buildUrn = req.params.buildUrn;
    const analyzer = req.params.analyzer;

    this
      ._runner
      .dropRunner(buildUrn, analyzer)
      /*.then(() => {
        return this._artifactManager.removeDirectory(Runner.normalizeRunnerName(buildUrn, analyzer));
      })*/
      .then(() => {
        res.sendStatus(200).end();
      })
      .catch((err) => {
        if (err instanceof RunnerNotFoundError) {
          res.status(404).json({ error: 'RunnerNotExists'});
          return Promise.reject();
        }

        next(err);
      })
    ;
  }
}
