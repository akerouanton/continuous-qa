<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\Build;
use M6Web\Bundle\AmqpBundle\Amqp\Producer;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

/**
 * @api {post} /builds/:projectUrn/new Create a new build for a project
 * @apiName CreateBuild
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} projectUrn URN of the project
 * @apiParam {String} repo_name  Name of the repository on Github (<code>form-data</code> parameter), should match <code>#^[\d*\w*]+\/[\d*\w*]+$#</code>
 * @apiSuccess (201) {Object}   build                       Freshly created build
 * @apiSuccess (201) {String}   build.id                  Build UUID
 * @apiSuccess (201) {String}   build.project_urn           Project URN
 * @apiSuccess (201) {String}   build.project_name          Project name
 * @apiSuccess (201) {String}   build.project_url           Repository URL
 * @apiSuccess (201) {String[]} build.analyzers             List of analyzers used for this build
 * @apiSuccess (201) {Object[]} build.analyses              List of analyses
 * @apiSuccess (201) {String}   build.analyses.analyzer     Analyzer name
 * @apiSuccess (201) {String}   build.analyses.state        One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 * @apiError (400) InvalidRepositoryNameError
 */
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
     * @param string  $projectUrn
     *
     * @return Response
     */
    public function create(Request $request, string $projectUrn)
    {
        $repoName = $request->request->get('repo_name');

        if (false === filter_var($repoName, FILTER_VALIDATE_REGEXP, ['options' => ['regexp' => '#^[\d*\w*]+\/[\d*\w*]+$#']])) {
            return new JsonResponse(['error' => 'InvalidRepositoryNameError'], 400);
        }

        $build = Build::createFromRepositoryName($projectUrn, $repoName, ['phpqa', 'php-cs-fixer']);
        $this->collection->insertOne($build);

        $request->attributes->set('build', $build);

        $location = $this->urlGenerator->generate(
            'get_build',
            ['projectUrn' => $projectUrn, 'buildId' => $build->getId()->toString()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        return new JsonResponse(['build' => $build], 201, ['Location' => $location]);
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
