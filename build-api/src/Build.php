<?php

declare(strict_types=1);

use Ramsey\Uuid\Uuid;

final class Build implements \JsonSerializable, \MongoDB\BSON\Persistable
{
    const STATE_CREATED  = 'created';
    const STATE_RUNNING  = 'running';
    const STATE_FINISHED = 'finished';

    /** @var mixed */
    private $_id;

    /** @var Uuid */
    private $uuid;

    /** @var string */
    private $projectUrn;

    /** @var string */
    private $projectName;

    /** @var string */
    private $projectUrl;

    /** @var Analysis[] */
    private $analyses;

    /** @var string[] */
    private $analyzers;

    /**
     * @param string   $projectUrn
     * @param string   $projectName
     * @param string   $projectUrl
     * @param string[] $analyzers
     */
    private function __construct(string $projectUrn, string $projectName, string $projectUrl, array $analyzers)
    {
        \Assert\that($projectUrn)->notEmpty();
        \Assert\that($projectName)->notEmpty();
        \Assert\that($projectUrl)->notEmpty();
        \Assert\that($analyzers)->notEmpty();

        $this->_id         = new \MongoDB\BSON\ObjectID();
        $this->uuid        = Uuid::uuid4();
        $this->projectUrn  = $projectUrn;
        $this->projectName = $projectName;
        $this->projectUrl  = $projectUrl;
        $this->analyzers   = $analyzers;

        foreach ($analyzers as $analyzer) {
            $this->analyses[] = Analysis::start($this, $analyzer);
        }
    }

    /**
     * @param string $projectUrn
     * @param string $repositoryName
     * @param array  $analyzers
     *
     * @return Build
     */
    public static function createFromRepositoryName(string $projectUrn, string $repositoryName, array $analyzers): Build
    {
        $projectUrl  = 'https://github.com/'.$repositoryName;

        return new self($projectUrn, $repositoryName, $projectUrl, $analyzers);
    }

    /**
     * @return Uuid
     */
    public function getUuid(): Uuid
    {
        return $this->uuid;
    }

    /**
     * @return string
     */
    public function getProjectName(): string
    {
        return $this->projectName;
    }

    /**
     * @return string
     */
    public function getProjectUrl(): string
    {
        return $this->projectUrl;
    }

    /**
     * @return Analysis[]
     */
    public function getAnalyses(): array
    {
        return $this->analyses;
    }

    /**
     * {@inheritdoc}
     */
    public function jsonSerialize(): array
    {
        return [
            'uuid'         => $this->uuid->toString(),
            'project_urn'  => $this->projectUrn,
            'project_name' => $this->projectName,
            'project_url'  => $this->projectUrl,
            'analyzers'    => $this->analyzers,
            'analyses'     => array_map(function (Analysis $analysis) {
                return $analysis->jsonSerialize();
            }, $this->analyses),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function bsonSerialize(): array
    {
        return [
            '_id'          => $this->_id,
            'uuid'         => $this->uuid->toString(),
            'project_urn'  => $this->projectUrn,
            'project_name' => $this->projectName,
            'project_url'  => $this->projectUrl,
            'analyzers'    => $this->analyzers,
            'analyses'     => array_map(function (Analysis $analysis) {
                return $analysis->bsonSerialize();
            }, $this->analyses),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function bsonUnserialize(array $data)
    {
        $this->_id         = (string) $data['_id'];
        $this->uuid        = Uuid::fromString($data['uuid']);
        $this->projectUrn  = $data['project_urn'];
        $this->projectName = $data['project_name'];
        $this->projectUrl  = $data['project_url'];
        $this->analyzers   = array_values($data['analyzers']);
        $this->analyses    = $data['analyses'];
    }
}
