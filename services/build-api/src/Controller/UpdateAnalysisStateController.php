<?php

namespace App\Controller;

use App\Exception\AnalysisNotFoundException;
use App\Exception\BuildNotFoundException;
use App\Model\Analysis;
use App\Service\BuildRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * @api {patch} /build/:buildUrn/:analyzer Update analysis state
 * @apiName UpdateAnalysisState
 * @apiGroup build-api
 * @apiVersion 0.1.0
 * @apiParam {String} buildUrn URN of the build
 * @apiParam {String} analyzer Name of the analyzer
 * @apiParam {String} state    New state (<code>form-data</code> parameter)
 * @apiParamExample Parameters Example
 *     buildUrn = urn:gh:knplabs/gaufrette:2
 *     analyzer = php-cs-fixer
 *     state = failed
 * @apiSuccess (200) {String}   state             Build state (either <code>started</code> or <code>finished</code>)
 * @apiSuccess (200) {String}   urn               Build URN
 * @apiSuccess (200) {String}   projectUrn        Project URN
 * @apiSuccess (200) {String}   repoUrl           Repository URL
 * @apiSuccess (200) {String}   reference         Commit/branch/tag reference
 * @apiSuccess (200) {String[]} analyzers         List of analyzers used for this build
 * @apiSuccess (200) {Object[]} analyses          List of analyses
 * @apiSuccess (200) {String}   analyses.analyzer Analyzer name
 * @apiSuccess (200) {String}   analyses.state    One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 * @apiError (400) InvalidState
 * @apiError (404) AnalysisNotFound
 */
class UpdateAnalysisStateController
{
    /** @var BuildRepository */
    private $repository;

    /**
     * @param BuildRepository $repository
     */
    public function __construct(BuildRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @param Request $request
     * @param string  $buildUrn
     * @param string  $analyzer
     *
     * @return JsonResponse
     */
    public function update(Request $request, string $buildUrn, string $analyzer)
    {
        if (null === ($state = $request->request->get('state')) || !in_array($state, Analysis::STATES)) {
            return new JsonResponse(['error' => 'InvalidState'], 400);
        }

        try {
            $build = $this->repository->updateAnalysisState($buildUrn, $analyzer, $state);
        } catch (AnalysisNotFoundException $exception) {
            return new JsonResponse(['error' => 'AnalysisNotFound'], 404);
        }

        return new JsonResponse($build);
    }
}
