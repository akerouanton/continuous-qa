<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\Build;
use App\Service\BuildRepository;
use M6Web\Bundle\AmqpBundle\Amqp\Producer;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @api {post} /builds/:projectUrn/new Create a new build
 * @apiName CreateBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParam {String} repoUrl    Url of the git repository (<code>form-data</code> parameter)
 * @apiParam {String} reference  Either a commit hash, a tag or a branch
 * @apiParamExample Parameters Example
 *     projectUrn = urn:gh:knplabs/gaufrette
 *     repoUrl    = https://github.com/knplabs/gaufrette
 *     reference  = master
 * @apiSuccess (200) {String}   state             Build state (<code>started</code>)
 * @apiSuccess (200) {String}   urn               Build URN
 * @apiSuccess (200) {String}   projectUrn        Project URN
 * @apiSuccess (200) {String}   repoUrl           Repository URL
 * @apiSuccess (200) {String}   reference         Commit/branch/tag reference
 * @apiSuccess (200) {String[]} analyzers         List of analyzers used for this build
 * @apiSuccess (200) {Object[]} analyses          List of analyses
 * @apiSuccess (200) {String}   analyses.analyzer Analyzer name
 * @apiSuccess (200) {String}   analyses.state    One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 * @apiError (400) MissingRepoUrl
 * @apiError (400) MissingReference
 */
final class CreateBuildController
{
    // const ANALYZERS = ['phpqa', 'php-cs-fixer'];
    const ANALYZERS = ['make-compose'];

    /** @var BuildRepository */
    private $repository;

    /** @var Producer */
    private $producer;

    /**
     * @param BuildRepository $repository
     * @param Producer        $producer
     */
    public function __construct(BuildRepository $repository, Producer $producer)
    {
        $this->repository = $repository;
        $this->producer   = $producer;
    }

    /**
     * @param Request $request
     * @param string  $projectUrn
     *
     * @return JsonResponse
     */
    public function create(Request $request, string $projectUrn)
    {
        if (null === $repoUrl = $request->request->get('repoUrl')) {
            return new JsonResponse(['error' => 'MissingRepoUrl'], 400);
        }
        if (null === $reference = $request->request->get('reference')) {
            return new JsonResponse(['error' => 'MissingReference'], 400);
        }

        $build = $this->repository->create($projectUrn, $repoUrl, $reference, self::ANALYZERS);
        $request->attributes->set('build', $build);

        return new JsonResponse($build, 200);
    }

    /**
     * Caled once the request has ended
     *
     * @param Request  $request
     * @param Response $response
     */
    public function pushEvents(Request $request, Response $response)
    {
        if ($response->getStatusCode() !== 200) {
            return;
        }

        /** @var Build $build */
        $build = $request->attributes->get('build');
        $this->producer->publishMessage(json_encode($build), AMQP_NOPARAM, [], ['build.created']);
    }
}
