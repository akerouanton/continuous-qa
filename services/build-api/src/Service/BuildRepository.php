<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\AnalysisNotFoundException;
use App\Exception\BuildNotFoundException;
use App\Model\Analysis;
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
     * @param string $reference
     * @param array  $analyzers
     *
     * @return Build
     */
    public function create(string $projectUrn, string $repoUrl, string $reference, array $analyzers): Build
    {
        $id = $this->projects->generateBuildId($projectUrn);
        $build = new Build($id, $projectUrn, $repoUrl, $reference, $analyzers);

        $this->builds->insertOne($build);

        return $build;
    }

    /**
     * @param string $buildUrn
     * @param string $analyzer
     * @param string $state
     *
     * @return Build
     *
     * @throws AnalysisNotFoundException
     */
    public function updateAnalysisState(string $buildUrn, string $analyzer, string $state): Build
    {
        $query = ['urn' => $buildUrn, 'analyses' => ['$elemMatch' => ['analyzer' => $analyzer]]];

        if (null === $build = $this->builds->findOneAndUpdate($query, ['$set' => ["analyses.$.state" => $state]])) {
            throw AnalysisNotFoundException::notFound($buildUrn, $analyzer);
        }

        // If there's no remaining runner in created/running state, build is considered as finished
        $updated = $this->builds->findOneAndUpdate([
            'urn'   => $buildUrn,
            'state' => Build::STATE_STARTED,
            '$and'  => [
                ['analyses' => ['$not' => ['$all' => [['$elemMatch' => ['state' => Analysis::STATE_CREATED]]]]]],
                ['analyses' => ['$not' => ['$all' => [['$elemMatch' => ['state' => Analysis::STATE_RUNNING]]]]]],
            ],
        ], ['$set' => ['state' => Build::STATE_FINISHED]]);


        if ($updated !== null) {
            $build = $updated;
            $build->finished();
        }

        return $build;
    }

    /**
     * @param string $buildUrn
     *
     * @return Build
     *
     * @throws BuildNotFoundException
     */
    public function get(string $buildUrn): Build
    {
        if (null === $build = $this->builds->findOne(['urn' => $buildUrn])) {
            throw BuildNotFoundException::notFound($buildUrn);
        }

        return $build;
    }

    /**
     * @param string $projectUrn
     *
     * @return Build[]
     *
     * @throws BuildNotFoundException
     */
    public function findAll(string $projectUrn): array
    {
        return $this->builds->find(['projectUrn' => $projectUrn], ['typeMap' => ['root' => null]])->toArray();
    }
}
