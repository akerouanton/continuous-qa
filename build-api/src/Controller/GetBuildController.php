<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
/**
 * @api {get} /builds/:projectUrn/:buildId Get a specific build for a project
 * @apiName GetBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParam {String} buildId Id of the build
 * @apiSuccess {String}   id                  Build UUID
 * @apiSuccess {String}   project_urn           Project URN
 * @apiSuccess {String}   project_name          Project name
 * @apiSuccess {String}   project_url           Repository URL
 * @apiSuccess {String[]} analyzers             List of analyzers used for this build
 * @apiSuccess {Object[]} analyses              List of analyses
 * @apiSuccess {String}   analyses.analyzer     Analyzer name
 * @apiSuccess {String}   analyses.state        One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
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
     * @param string $projectUrn
     * @param string $buildId
     *
     * @return Response
     */
    public function get(string $projectUrn, string $buildId)
    {
        $build = $this->collection->findOne(
            ['project_urn' => $projectUrn, 'id' => $buildId],
            ['typeMap' => ['root' => null]]
        );

        /** @var \MongoDB\Collection $collection */
        if (null === $build) {
            return new Response('', 404);
        }

        return new Response(json_encode($build), 200);
    }
}
