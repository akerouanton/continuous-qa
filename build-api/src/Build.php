<?php

declare(strict_types=1);

use Ramsey\Uuid\Uuid;

final class Build implements \JsonSerializable, \MongoDB\BSON\Persistable
{
    const STATE_CREATED = 'created';

    /** @var mixed */
    private $_id;

    /** @var Uuid */
    private $uuid;

    /** @var string */
    private $projectName;

    /** @var string */
    private $projectUrl;

    /** @var Analysis[] */
    private $analyses;

    /** @var string[] */
    private $analyzers;

    /** @var string */
    private $state;

    /**
     * @param string   $projectName
     * @param string   $projectUrl
     * @param string[] $analyzers
     */
    private function __construct(string $projectName, string $projectUrl, array $analyzers)
    {
        \Assert\that($projectName)->notEmpty();
        \Assert\that($projectUrl)->notEmpty();
        \Assert\that($analyzers)->notEmpty();

        $this->_id         = new \MongoDB\BSON\ObjectID();
        $this->uuid        = Uuid::uuid4();
        $this->projectName = $projectUrl;
        $this->projectUrl  = $projectUrl;
        $this->analyzers   = $analyzers;

        foreach ($analyzers as $analyzer) {
            $this->analyses[] = Analysis::start($this, $analyzer);
        }
    }

    /**
     * @param string $repositoryName
     * @param array  $analyzers
     *
     * @return Build
     */
    public static function createFromRepositoryName(string $repositoryName, array $analyzers): Build
    {
        $projectName = substr($repositoryName, strpos($repositoryName, '/')+1);
        $projectUrl  = 'https://github.com/'.$repositoryName;

        return new self($projectName, $projectUrl, $analyzers);
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
            'uuid'        => $this->uuid->toString(),
            'projectName' => $this->projectName,
            'projectUrl'  => $this->projectUrl,
            'analyzers'   => $this->analyzers,
            'state'       => $this->state,
            'analyses'    => array_map(function (Analysis $analysis) {
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
            'uuid'        => $this->uuid->toString(),
            'projectName' => $this->projectName,
            'projectUrl'  => $this->projectUrl,
            'analyzers'   => $this->analyzers,
            'state'       => $this->state,
            'analyses'    => array_map(function (Analysis $analysis) {
                return $analysis->bsonSerialize();
            }, $this->analyses),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function bsonUnserialize(array $data)
    {
        $this->_id         = (string) $data['id'];
        $this->uuid        = Uuid::fromString($data['uuid']);
        $this->projectName = $data['projectName'];
        $this->projectUrl  = $data['projectUrl'];
        $this->analyzers   = $data['analyzers'];
        $this->analyses    = $data['analyses'];
        $this->state       = $data['state'];
    }
}
