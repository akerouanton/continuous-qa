const express = require('express');

import CreateRunner from './action/CreateRunner';
import DropRunner from './action/DropRunner';
import {validateRunnerUrn} from './service/HttpParamHandler';

export default function router(runner) {
  const router = express.Router();

  const createRunner = new CreateRunner(runner);
  const dropRunner = new DropRunner(runner);

  router.put('/runner/:runnerUrn', createRunner.handleRequest.bind(createRunner));
  router.delete('/runner/:runnerUrn', dropRunner.handleRequest.bind(dropRunner));
  router.param('runnerUrn', validateRunnerUrn);

  return router;
}
