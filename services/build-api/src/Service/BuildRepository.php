<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Build;
use MongoDB\Collection;

class BuildRepository
{
    /** @var ProjectRepository */
    private $projects;

    /**
     * @param Collection        $builds
     * @param ProjectRepository $projects
     */
    public function __construct(Collection $builds, ProjectRepository $projects)
    {
        $this->builds   = $builds;
        $this->projects = $projects;
    }

    /**
     * @param string $projectUrn
     * @param string $repoUrl
     * @param array  $analyzers
     *
     * @return Build
     */
    public function create(string $projectUrn, string $repoUrl, array $analyzers): Build
    {
        $id    = $this->projects->generateBuildId($projectUrn);
        $build = new Build($id, $projectUrn, $repoUrl, $analyzers);

        $this->builds->insertOne($build);

        return $build;
    }
}
