<?php

declare(strict_types=1);

namespace App\Model;

use Ramsey\Uuid\Uuid;

final class Analysis implements \JsonSerializable, \MongoDB\BSON\Persistable
{
    const STATES = [self::STATE_CREATED, self::STATE_QUEUED, self::STATE_RUNNING, self::STATE_FINISHED, self::STATE_ERRONEOUS];
    const STATE_CREATED  = 'created';
    const STATE_QUEUED   = 'queued';
    const STATE_RUNNING  = 'running';
    const STATE_FINISHED = 'finished';
    const STATE_ERRONEOUS = 'erroneous';

    /** @var mixed */
    private $_id;

    /** @var string */
    private $buildId;

    /** @var string */
    private $projectName;

    /** @var string */
    private $projectUrl;

    /** @var string */
    private $analyzer;

    /** @var string */
    private $state;

    /**
     * @param Uuid   $buildId
     * @param string $projectName
     * @param string $projectUrl
     * @param string $analyzer
     */
    private function __construct(Uuid $buildId, string $projectName, string $projectUrl, string $analyzer)
    {
        \Assert\that($buildId)->notEmpty();
        \Assert\that($projectName)->notEmpty();
        \Assert\that($projectUrl)->notEmpty();
        \Assert\that($analyzer)->notEmpty();

        $this->_id         = new \MongoDB\BSON\ObjectID();
        $this->buildId     = $buildId;
        $this->projectName = $projectName;
        $this->projectUrl  = $projectUrl;
        $this->analyzer    = $analyzer;
        $this->state       = self::STATE_CREATED;

    }

    /**
     * @param string $analyzer
     *
     * @return Analysis
     */
    public static function start(Build $build, string $analyzer)
    {
        return new self($build->getId(), $build->getProjectName(), $build->getProjectUrl(), $analyzer);
    }

    /**
     * @param string $newState
     */
    public function changeState(string $newState)
    {
        \Assert\that($newState)->inArray(self::STATES);

        $this->state = $newState;
    }

    /**
     * {@inheritdoc}
     */
    public function jsonSerialize()
    {
        return [
            'analyzer'     => $this->analyzer,
            'state'        => $this->state,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function bsonSerialize()
    {
        return array_merge($this->jsonSerialize(), [
            '_id'          => $this->_id,
            '__pclass'     => new \MongoDB\BSON\Binary(self::class, 0x80),
            'build_id'     => $this->buildId->toString(),
            'project_name' => $this->projectName,
            'project_url'  => $this->projectUrl,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function bsonUnserialize(array $data)
    {
        $this->_id         = $data['_id'];
        $this->state       = $data['state'];
        $this->buildId     = Uuid::fromString($data['build_id']);
        $this->projectName = $data['project_name'];
        $this->projectUrl  = $data['project_url'];
        $this->analyzer    = $data['analyzer'];
    }
}
