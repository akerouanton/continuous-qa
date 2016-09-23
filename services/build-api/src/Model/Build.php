<?php

declare(strict_types=1);

namespace App\Model;

use MongoDB\Model\BSONArray;

final class Build implements \JsonSerializable, \MongoDB\BSON\Persistable
{
    const STATE_STARTED  = 'started';
    const STATE_FINISHED = 'finished';

    /** @var mixed */
    private $_id;

    /** @var string */
    private $urn;

    /** @var string */
    private $projectUrn;

    /** @var string */
    private $repoUrl;

    /** @var string */
    private $reference;

    /** @var Analysis[] */
    private $analyses;

    /** @var string[] */
    private $analyzers;

    /** @var string */
    private $state;

    /**
     * @param int      $buildId
     * @param string   $projectUrn
     * @param string   $repoUrl
     * @param string   $reference
     * @param string[] $analyzers
     */
    public function __construct(int $buildId, string $projectUrn, string $repoUrl, string $reference, array $analyzers)
    {
        \Assert\that($projectUrn)->notEmpty();
        \Assert\that($repoUrl)->notEmpty();
        \Assert\that($reference)->notEmpty();
        \Assert\that($analyzers)->notEmpty();

        $this->_id        = new \MongoDB\BSON\ObjectID();
        $this->urn        = sprintf('%s:%s', $projectUrn, $buildId);
        $this->projectUrn = $projectUrn;
        $this->repoUrl    = $repoUrl;
        $this->reference  = $reference;
        $this->analyzers  = $analyzers;
        $this->state      = self::STATE_STARTED;

        foreach ($analyzers as $analyzer) {
            $this->analyses[] = new Analysis($analyzer);
        }
    }

    /**
     * @return string
     */
    public function getUrn(): string
    {
        return $this->urn;
    }

    /**
     * @return string
     */
    public function getProjectUrn(): string
    {
        return $this->projectUrn;
    }

    /**
     * @return string
     */
    public function getRepoUrl(): string
    {
        return $this->repoUrl;
    }

    /**
     * @return string
     */
    public function getReference(): string
    {
        return $this->reference;
    }

    /**
     * @return Analysis[]
     */
    public function getAnalyses(): array
    {
        return $this->analyses;
    }

    /**
     * @return void
     */
    public function finished()
    {
        $this->state = self::STATE_FINISHED;
    }

    /**
     * @param string $analyzer
     *
     * @return Analysis
     */
    private function getAnalysis(string $analyzer): Analysis
    {
        foreach ($this->analyses as $analysis) {
            if ($analysis->getAnalyzer() === $analyzer) {
                return $analysis;
            }
        }

        throw new \RuntimeException(sprintf('There are no analysis using "%s".', $analyzer));
    }

    /**
     * {@inheritdoc}
     */
    public function jsonSerialize(): array
    {
        return [
            'state'       => $this->state,
            'urn'         => $this->urn,
            'projectUrn'  => $this->projectUrn,
            'repoUrl'     => $this->repoUrl,
            'reference'   => $this->reference,
            'analyzers'   => $this->analyzers,
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
            '_id'         => $this->_id,
            'state'       => $this->state,
            'urn'         => $this->urn,
            'projectUrn'  => $this->projectUrn,
            'reference'   => $this->reference,
            'repoUrl'     => $this->repoUrl,
            'analyzers'   => $this->analyzers,
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
        $this->_id        = (string) $data['_id'];
        $this->state      = $data['state'];
        $this->urn        = $data['urn'];
        $this->projectUrn = $data['projectUrn'];
        $this->repoUrl    = $data['repoUrl'];
        $this->reference  = $data['reference'];
        $this->analyzers  = array_values((array) $data['analyzers']);
        $this->analyses   = $data['analyses'];

        if ($this->analyses instanceof BSONArray) {
            $this->analyses = $this->analyses->getIterator()->getArrayCopy();
        }
    }
}
