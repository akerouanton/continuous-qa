<?php

declare(strict_types=1);

namespace App\Controller;

use MongoDB\Collection;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @api {get} /builds/:projectUrn Get builds for a project
 * @apiName GetBuildsHistory
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParamExample Parameter Example
 *     projectUrn = urn:gh:knplabs/gaufrette
 * @apiSuccess {String}   state             Build state (either <code>started</code> or <code>finished</code>)
 * @apiSuccess {String}   urn               Build URN
 * @apiSuccess {String}   projectUrn       Project URN
 * @apiSuccess {String}   repoUrl          Repository URL
 * @apiSuccess {String[]} analyzers         List of analyzers used for this build
 * @apiSuccess {Object[]} analyses          List of analyses
 * @apiSuccess {String}   analyses.analyzer Analyzer name
 * @apiSuccess {String}   analyses.state    One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 */
final class GetBuildHistoryController
{
    /** @var Collection */
    private $collection;

    /**
     * @param Collection $collection
     */
    public function __construct(Collection $collection)
    {
        $this->collection = $collection;
    }

    /**
     * @param string $projectUrn
     *
     * @return JsonResponse
     */
    public function getHistory(string $projectUrn)
    {
        $builds = $this->collection->find(['projectUrn' => $projectUrn], ['typeMap' => ['root' => null]])->toArray();

        return new JsonResponse($builds);
    }
}
