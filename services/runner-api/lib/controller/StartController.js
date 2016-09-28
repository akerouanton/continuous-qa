const Promise = require('promise');

import Runner from '../service/Runner';
import {RunnerAlreadyExistsError, AnalyzerNotSupportedError} from '../service/RunnerError';

/**
 * @api {post} /runner/:buildUrn/:analyzer/start Start a new runner
 * @apiName StartRunner
 * @apiGroup runner-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn   Build URN
 * @apiParam {String} analyzer   Either <code>php-cs-fixer</code> or <code>phpqa</code>
 * @apiParam {String} repoUrl    URL of the repository to clone
 * @apiParam {String} reference  Either a commit hash, a tag or a branch
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:30
 *     analyzer = php-cs-fixer
 *     repoUrl = https://github.com/KnpLabs/Gaufrette
 *     reference = master
 * @apiError (400) UrnNotValid          The build URN is not valid
 * @apiError (400) MissingRepoUrl       <code>repoUrl</code> is missing
 * @apiError (400) MissingReference
 * @apiError (404) AnalyzerNotSupported
 * @apiError (409) RunnerAlreadyCreated
 */
export default class {
  constructor(runner, artifactManager) {
    this._runner = runner;
    this._artifactManager = artifactManager;
  }

  handleRequest(req, res, next) {
    const buildUrn = req.params.buildUrn;
    const analyzer = req.params.analyzer;
    const repoUrl = req.body.repoUrl || null;
    const reference = req.body.reference || null;

    if (repoUrl === null) {
      res.status(400).json({ error: 'MissingRepoUrl' });
      return;
    }
    if (reference === null) {
      res.status(400).json({error: 'MissingReference'});
      return;
    }

    const name = Runner.normalizeRunnerName(buildUrn, analyzer);

    /*this
      ._artifactManager
      .createDirectory(name)*/
    Promise.resolve(this._artifactManager.getDirectory(name))
      .then((artifactDirectory) => {
        return this
          ._runner
          .startRunner(buildUrn, analyzer, repoUrl, reference, artifactDirectory)
        ;
      })
      .then(() => {
        res.sendStatus(200).end();
      })
      .catch((err) => {
        if (err instanceof AnalyzerNotSupportedError) {
          res.status(404).json({ error: 'AnalyzerNotSupported'});
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
