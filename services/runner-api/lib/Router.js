const express = require('express');

import StartController from './controller/StartController';
import DropController from './controller/DropController';
import {validateRunnerUrn} from './service/HttpParamHandler';

export default function router(runner) {
  const router = express.Router();

  const startController = new StartController(runner);
  const dropController = new DropController(runner);

  router.put('/runner/:runnerUrn', startController.handleRequest.bind(startController));
  router.delete('/runner/:runnerUrn', dropController.handleRequest.bind(dropController));
  router.param('runnerUrn', validateRunnerUrn);

  return router;
}
