const express = require('express');

import {handleCreatePipeline, validateCreatePipeline} from './action/CreatePipeline';
import {handleGetPipeline} from './action/GetPipeline';
import {handleListPipelines} from './action/ListPipelines';
import {handleFindMatchingPipeline} from './action/FindMatchingPipeline';
import * as httpParamHandler from './service/HttpParamHandler';

export default function router() {
  const router = express.Router();

  router.get('/pipeline/:projectUrn/:pattern', handleGetPipeline);
  router.get('/pipelines/:projectUrn', handleListPipelines);
  router.get('/pipelines/:projectUrn/matching/:branch', handleFindMatchingPipeline);
  router.put('/pipeline/:projectUrn/:pattern', [validateCreatePipeline, handleCreatePipeline]);

  router.param('projectUrn', httpParamHandler.validateProjectUrn);
  router.param('pattern', httpParamHandler.validatePattern);
  router.param('branch', httpParamHandler.validateBranch);

  return router;
};
