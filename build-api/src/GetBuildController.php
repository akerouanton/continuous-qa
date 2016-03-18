<?php

declare(strict_types=1);

use Symfony\Component\HttpFoundation\Response;

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
            ['project_urn' => $projectUrn, 'uuid' => $buildId],
            ['typeMap' => ['root' => null]]
        );

        /** @var \MongoDB\Collection $collection */
        if (null === $build) {
            return new Response('', 404);
        }

        return new Response(json_encode($build), 200);
    }
}
