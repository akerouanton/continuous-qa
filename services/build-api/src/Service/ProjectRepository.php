<?php

declare(strict_types=1);

namespace App\Service;

use MongoDB\Collection;

class ProjectRepository
{
    /** @var Collection */
    private $projects;

    /**
     * @param Collection $projects
     */
    public function __construct(Collection $projects)
    {
        $this->projects = $projects;
    }

    /**
     * @param string $projectUrn
     *
     * @return int
     */
    public function generateBuildId(string $projectUrn): int
    {
        $value = $this
            ->projects
            ->findOneAndUpdate(
                ['urn' => $projectUrn],
                ['$inc' => ['builds' => 1]],
                ['projection' => ['_id' => false, 'builds' => true], 'upsert' => true]
            )
        ;

        return intval($value->builds) + 1;
    }
}
