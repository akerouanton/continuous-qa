const express = require('express');

import * as HandleGithubEvent from './action/HandleGithubEvent';

export default function router() {
  const router = express.Router();

  router.post('/hook/gh', HandleGithubEvent.validateRequest, HandleGithubEvent.handleRequest);

  return router;
}
