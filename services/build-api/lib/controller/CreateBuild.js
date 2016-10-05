import Build from '../model/Build';

/**
 * @api {post} /builds/:projectUrn/new Create a new build
 * @apiName CreateBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParam {String} branch
 * @apiParam {String} repoUrl    Url of the git repository (<code>form-data</code> parameter)
 * @apiParamExample Parameters Example
 *     projectUrn = urn:gh:knplabs/gaufrette
 *     repoUrl    = https://github.com/knplabs/gaufrette
 *     branch     = master
 * @apiSuccess (200) {String}   projectUrn           Project URN
 * @apiSuccess (200) {String}   branch
 * @apiSuccess (200) {Number}   buildId
 * @apiSuccess (200) {String}   repoUrl              Repository URL
 * @apiSuccess (200) {String}   state                Build state (<code>created, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages
 * @apiSuccess (200) {String}   stages.state         Stage state (<code>queued, started, finished</code>)
 * @apiSuccess (200) {Object[]} stages.runners
 * @apiSuccess (200) {String}   stages.runners.name
 * @apiSuccess (200) {String}   stages.runners.state
 * @apiError (400) MissingBranch
 * @apiError (400) MissingRepoUrl
 */
export default function CreateBuild(req, res, next) {
  const projectUrn = req.params.projectUrn;
  const branch = req.body.branch || null;
  const repoUrl = req.body.repoUrl || null;

  if (branch === null) {
    return res.status(400).json({error: 'MissingBranch'});
  } else if (repoUrl === null) {
    return res.status(400).json({error: 'MissingRepoUrl'});
  }

  const build = new Build({
    projectUrn: projectUrn,
    branch: branch,
    repoUrl: repoUrl
  });

  build
    .save()
    .then(build => res.status(200).location(`/build/${encodeURIComponent(build.urn)}`).json(build))
    .catch(err => next(err))
  ;
}
