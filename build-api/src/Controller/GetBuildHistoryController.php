<?php

declare(strict_types=1);

namespace App\Controller;

use MongoDB\Collection;
use Symfony\Component\HttpFoundation\Response;

/**
 * @api {get} /builds/:projectUrn Build history for a project
 * @apiName GetBuildsHistory
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} project URN of the project
 * @apiSuccess {Object[]} builds                       List of builds for the :projectUrn
 * @apiSuccess {String}   builds.id                  Build UUID
 * @apiSuccess {String}   builds.project_urn           Project URN
 * @apiSuccess {String}   builds.project_name          Project name
 * @apiSuccess {String}   builds.project_url           Repository URL
 * @apiSuccess {String[]} builds.analyzers             List of analyzers used for this build
 * @apiSuccess {Object[]} builds.analyses              List of analyses
 * @apiSuccess {String}   builds.analyses.analyzer     Analyzer name
 * @apiSuccess {String}   builds.analyses.state        One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
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
     * @return Response
     */
    public function getHistory(string $projectUrn)
    {
        $builds = $this->collection->find(['project' => $projectUrn], ['typeMap' => ['root' => null]]);

        return new Response(json_encode($builds));
    }
}
