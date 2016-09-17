<?php

declare(strict_types=1);

namespace App\Model;

final class Analysis implements \JsonSerializable, \MongoDB\BSON\Persistable
{
    const STATES = [self::STATE_CREATED, self::STATE_RUNNING, self::STATE_STOPPED, self::STATE_FAILED, self::STATE_SUCCEEDED];
    const STATE_CREATED   = 'created';
    const STATE_RUNNING   = 'running';
    const STATE_STOPPED   = 'stopped';
    const STATE_FAILED    = 'failed';
    const STATE_SUCCEEDED = 'succeeded';

    /** @var mixed */
    private $_id;

    /** @var string */
    private $analyzer;

    /** @var string */
    private $state;

    /**
     * @param string $analyzer
     */
    public function __construct(string $analyzer)
    {
        \Assert\that($analyzer)->notEmpty();

        $this->_id      = new \MongoDB\BSON\ObjectID();
        $this->analyzer = $analyzer;
        $this->state    = self::STATE_CREATED;

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
     * @return string
     */
    public function getState(): string
    {
        return $this->state;
    }

    /**
     * @return string
     */
    public function getAnalyzer(): string
    {
        return $this->analyzer;
    }

    /**
     * {@inheritdoc}
     */
    public function jsonSerialize()
    {
        return [
            'analyzer' => $this->analyzer,
            'state'    => $this->state,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function bsonSerialize()
    {
        return array_merge($this->jsonSerialize(), [
            '_id'      => $this->_id,
            '__pclass' => new \MongoDB\BSON\Binary(self::class, 0x80),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function bsonUnserialize(array $data)
    {
        $this->_id      = $data['_id'];
        $this->analyzer = $data['analyzer'];
        $this->state    = $data['state'];
    }
}
