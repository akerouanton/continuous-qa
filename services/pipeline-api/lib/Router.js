const express = require('express');

import GetPipeline from './controller/GetPipeline';
import CreatePipeline from './controller/CreatePipeline';
import FindMatchingPipeline from './controller/FindMatchingPipeline';
import HttpParamHandler from './service/HttpParamHandler';

export default function () {
  const router = express.Router();

  const getPipeline = new GetPipeline();
  const createPipeline = new CreatePipeline();
  const findMatchingPipeline = new FindMatchingPipeline();

  router.get('/pipeline/:pipelineUrn', getPipeline.handleRequest.bind(getPipeline));
  router.get('/pipelines/:projectUrn/matching/:branch', findMatchingPipeline.handleRequest.bind(findMatchingPipeline));
  router.put('/pipeline/:pipelineUrn', createPipeline.handleRequest.bind(createPipeline));

  router.param('pipelineUrn', HttpParamHandler.pipelineUrn);
  router.param('projectUrn', HttpParamHandler.projectUrn);
  router.param('branch', HttpParamHandler.branch);

  return router;
};
