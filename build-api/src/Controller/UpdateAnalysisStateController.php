<?php

namespace App\Controller;

use App\Model\Analysis;
use App\Model\Build;
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
 * @apiSuccess (201) {String}   state             Build state (either <code>started</code> or <code>finished</code>)
 * @apiSuccess (201) {String}   urn               Build URN
 * @apiSuccess (201) {String}   projectUrn       Project URN
 * @apiSuccess (201) {String}   repoUrl          Repository URL
 * @apiSuccess (201) {String[]} analyzers         List of analyzers used for this build
 * @apiSuccess (201) {Object[]} analyses          List of analyses
 * @apiSuccess (201) {String}   analyses.analyzer Analyzer name
 * @apiSuccess (201) {String}   analyses.state    One of: <code>created</code>, <code>queued</code>, <code>running</code>, <code>finished</code>, <code>erroneous</code>
 * @apiError (400) InvalidState
 * @apiError (404) BuildNotFound
 * @apiError (404) AnalysisNotFound
 */
class UpdateAnalysisStateController
{
    private $collection;

    /**
     * @param \MongoDB\Collection $collection
     */
    public function __construct(\MongoDB\Collection $collection)
    {
        $this->collection = $collection;
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
            return new JsonResponse([
                'error' => 'InvalidState',
            ], 400);
        }

        if (null === $build = $this->collection->findOne(['urn' => $buildUrn])) {
            return new JsonResponse(['error' => 'BuildNotFound'], 404);
        }

        $query = [
            'urn' => $buildUrn,
            'analyses' => [
                '$elemMatch' => [
                    "analyzer" => $analyzer,
                ],
            ],
        ];
        /** @var Build|null $build */
        $build = $this->collection->findOneAndUpdate($query, ['$set' => ["analyses.$.state" => $state]]);

        if ($build === null) {
            return new JsonResponse(['error' => 'AnalysisNotFound'], 404);
        }

        $build->changeAnalysisState($analyzer, $state);

        return new JsonResponse($build);
    }
}
