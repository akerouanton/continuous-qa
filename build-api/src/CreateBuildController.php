<?php

declare(strict_types=1);

use M6Web\Bundle\AmqpBundle\Amqp\Producer;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

final class CreateBuildController
{
    /** @var \MongoDB\Collection */
    private $collection;

    /** @var Producer */
    private $producer;

    /** @var UrlGeneratorInterface */
    private $urlGenerator;

    /**
     * @param \MongoDB\Collection $collection
     * @param Producer            $producer
     */
    public function __construct(\MongoDB\Collection $collection, Producer $producer, UrlGeneratorInterface $urlGenerator)
    {
        $this->collection   = $collection;
        $this->producer     = $producer;
        $this->urlGenerator = $urlGenerator;
    }

    /**
     * @param Request $request
     *
     * @return Response
     */
    public function create(Request $request)
    {
        $repoName = $request->get('repo_name');

        if (false === filter_var($repoName, FILTER_VALIDATE_REGEXP, ['options' => ['regexp' => '#^[\d*\w*]+\/[\d*\w*]+$#']])) {
            return new Response('You should provide a valid repository name.', 400);
        }

        $build = Build::createFromRepositoryName($repoName, ['phpqa', 'php-cs-fixer']);
        $this->collection->insertOne($build);

        $request->attributes->set('build', $build);

        $location = $this->urlGenerator->generate(
            'get_build',
            ['id' => $build->getUuid()->toString()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        return new Response(json_encode($build), 201, ['Location' => $location]);
    }

    /**
     * After middleware:
     * will publish an amqp message in order to start the analysis,
     * after the controller sent a 201 response
     *
     * @param Request  $request
     * @param Response $response
     */
    public function pushEvents(Request $request, Response $response)
    {
        if ($response->getStatusCode() !== 201) {
            return;
        }

        /** @var Build $build */
        $build = $request->attributes->get('build');

        foreach ($build->getAnalyses() as $analysis) {
            $this->producer->publishMessage(json_encode($analysis), AMQP_NOPARAM, [], ['run_analysis']);
        }
    }
}
