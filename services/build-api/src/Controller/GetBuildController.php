<?php

declare(strict_types=1);

namespace App\Controller;

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
 * @apiSuccess {String}   projectUrn       Project URN
 * @apiSuccess {String}   repoUrl          Repository URL
 * @apiSuccess {String[]} analyzers         List of analyzers used for this build
 * @apiSuccess {Object[]} analyses          List of analyses
 * @apiSuccess {String}   analyses.analyzer Analyzer name
 * @apiSuccess {String}   analyses.state    One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 * @apiError (404) BuildNotFound
 */
final class GetBuildController
{
    /** @var \MongoDB\Collection */
    private $collection;

    /**
     * @param \MongoDB\Collection $collection
     */
    public function __construct(\MongoDB\Collection $collection)
    {
        $this->collection = $collection;
    }

    /**
     * @param string $buildUrn
     *
     * @return JsonResponse
     */
    public function get(string $buildUrn)
    {
        $build = $this->collection->findOne(['urn' => $buildUrn]);

        if (null === $build) {
            return new JsonResponse(['error' => 'BuildNotFound'], 404);
        }

        return new JsonResponse($build, 200);
    }
}
