const _ = require('underscore');

import Build from '../model/Build';

/**
 * @api {post} /builds/:projectUrn/new Create a new build
 * @apiName CreateBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParam {String} repoUrl    Url of the git repository (<code>form-data</code> parameter)
 * @apiParam {String} branch
 * @apiParam {String} ref        Commit hash
 * @apiParamExample Parameters Example
 *     projectUrn = urn:cqa:gh:knplabs/gaufrette
 *     repoUrl    = https://github.com/knplabs/gaufrette
 *     branch     = master
 *     ref        = 0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c
 * @apiSuccess (200) {String}   projectUrn           Project URN
 * @apiSuccess (200) {String}   branch
 * @apiSuccess (200) {Number}   buildId
 * @apiSuccess (200) {String}   repoUrl              Repository URL
 * @apiSuccess (200) {String}   Ref                  Commit hash
 * @apiSuccess (200) {String}   state                Build state (<code>created, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {String}   stages.state         Stage state (<code>queued, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages.tasks
 * @apiSuccess (200) {String}   stages.tasks.name
 * @apiSuccess (200) {String}   stages.tasks.state
 * @apiError (400) MissingBranch
 * @apiError (400) MissingRepoUrl
 * @apiError (400) MissingRef
 */
export default function CreateBuild(req, res, next) {
  const projectUrn = req.params.projectUrn;
  const {branch, repoUrl, ref} = req.body;

  if (branch === null) {
    return res.status(400).json({error: 'MissingBranch'});
  } else if (repoUrl === null) {
    return res.status(400).json({error: 'MissingRepoUrl'});
  } else if (ref === null) {
    return res.status(400).json({error: 'MissingRef'});
  }

  new Build({projectUrn, branch, repoUrl, ref})
    .save()
    .then(build => res.status(200).json(build))
    .catch(err => next(err))
  ;
}
