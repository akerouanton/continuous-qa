<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\BuildNotFoundException;
use App\Service\BuildRepository;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @api {get} /build/:buildUrn Get a specific build
 * @apiName GetBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn URN of the build
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:1
 * @apiSuccess {String}   state             Build state (either <code>started</code> or <code>finished</code>)
 * @apiSuccess {String}   urn               Build URN
 * @apiSuccess {String}   projectUrn        Project URN
 * @apiSuccess {String}   repoUrl           Repository URL
 * @apiSuccess {String}   reference         Commit/branch/tag reference
 * @apiSuccess {String[]} analyzers         List of analyzers used for this build
 * @apiSuccess {Object[]} analyses          List of analyses
 * @apiSuccess {String}   analyses.analyzer Analyzer name
 * @apiSuccess {String}   analyses.state    One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 * @apiError (404) BuildNotFound
 */
final class GetBuildController
{
    /** @var BuildRepository */
    private $repository;

    /**
     * @param BuildRepository $repository
     */
    public function __construct(BuildRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @param string $buildUrn
     *
     * @return JsonResponse
     */
    public function get(string $buildUrn)
    {
        try {
            $build = $this->repository->get($buildUrn);
        } catch (BuildNotFoundException $exception) {
            return new JsonResponse(['error' => 'BuildNotFound'], 404);
        }

        return new JsonResponse($build, 200);
    }
}
