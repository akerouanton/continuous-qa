<?php

declare(strict_types=1);

use MongoDB\Collection;
use Symfony\Component\HttpFoundation\Response;

final class GetBuildsHistoryController
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
        $builds = $this->collection->find(['projectUrn' => $projectUrn], ['typeMap' => ['root' => null]]);

        return new Response(json_encode($builds));
    }
}
