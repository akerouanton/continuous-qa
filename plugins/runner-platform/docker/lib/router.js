const express = require('express');

import StartRunner from './action/StartRunner';
import DropRunner from './action/DropRunner';
import {validateRunnerUrn} from './service/HttpParamHandler';

export default function router(runner) {
  const router = express.Router();

  const startRunner = new StartRunner(runner);
  const dropRunner = new DropRunner(runner);

  router.put('/runner/:runnerUrn', startRunner.handleRequest.bind(startRunner));
  router.delete('/runner/:runnerUrn', dropRunner.handleRequest.bind(dropRunner));
  router.param('runnerUrn', validateRunnerUrn);

  return router;
}
