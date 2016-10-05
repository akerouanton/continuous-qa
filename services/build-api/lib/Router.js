const express = require('express');

import CreateBuild from './controller/CreateBuild';
import GetBuild from './controller/GetBuild';
import GetBuildHistory from './controller/GetBuildHistory';
import UpdateRunnerState from './controller/UpdateRunnerState';
import RunBuild from './controller/RunBuild';
import HttpParamHandler from './service/HttpParamHandler';

export default function () {
  const router = express.Router();

  router.post('/builds/:projectUrn/new', CreateBuild);
  router.get('/build/:buildUrn', GetBuild);
  router.get('/builds/:projectUrn', GetBuildHistory);
  router.patch('/build/:buildUrn/:stage/:runner', UpdateRunnerState);
  router.post('/build/:buildUrn/run', RunBuild);

  router.param('projectUrn', HttpParamHandler.projectUrn);
  router.param('buildUrn', HttpParamHandler.buildUrn);
  router.param('stage', HttpParamHandler.stage);
  router.param('runner', HttpParamHandler.runner);

  return router;
}
