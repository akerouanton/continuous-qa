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
     * @param string $id
     *
     * @return Response
     */
    public function get(string $id)
    {
        $build = $this->collection->findOne(['uuid' => $id], ['typeMap' => ['root' => 'Build']]);

        /** @var \MongoDB\Collection $collection */
        if (null === $build) {
            return new Response('', 404);
        }

        return new Response(json_encode($build), 201);
    }
}
