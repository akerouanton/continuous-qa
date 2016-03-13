<?php

class Analysis implements \JsonSerializable, \MongoDB\BSON\Persistable
{
    const STATES = [self::STATE_CREATED, self::STATE_QUEUED, self::STATE_RUNNING];
    const STATE_CREATED  = 'created';
    const STATE_QUEUED   = 'queued';
    const STATE_RUNNING  = 'running';

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
     * @param string $buildId
     * @param string $projectName
     * @param string $projectUrl
     * @param string $analyzer
     */
    private function __construct(string $buildId, string $projectName, string $projectUrl, string $analyzer)
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
        return new self($build->getUuid(), $build->getProjectName(), $build->getProjectUrl(), $analyzer);
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
            'build_id'     => $this->buildId,
            'project_name' => $this->projectName,
            'project_url'  => $this->projectUrl,
            'analyzer'     => $this->analyzer,
            'state'        => $this->state,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function bsonSerialize()
    {
        return ['_id' => $this->_id, '__pclass' => new \MongoDB\BSON\Binary(self::class, 0x80)] + $this->jsonSerialize();
    }

    /**
     * {@inheritdoc}
     */
    public function bsonUnserialize(array $data)
    {
        $this->_id         = $data['_id'];
        $this->state       = $data['state'];
        $this->buildId     = $data['build_id'];
        $this->projectName = $data['project_name'];
        $this->projectUrl  = $data['project_url'];
        $this->analyzer    = $data['analyzer'];
    }
}
