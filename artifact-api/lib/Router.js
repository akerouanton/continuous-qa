const express = require('express');

import ListArtifacts from './controller/ListArtifacts';
import RetrieveArtifact from './controller/RetrieveArtifact';
import PutArtifact from './controller/PutArtifact';

export default (collection) => {
  const router = express.Router();

  ListArtifacts(router, collection);
  RetrieveArtifact(router, collection);
  PutArtifact(router, collection);

  return router;
};
