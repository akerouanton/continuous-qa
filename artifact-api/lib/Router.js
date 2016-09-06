const express = require('express');

import ListArtifacts from './controller/ListArtifacts';
import RetrieveArtifact from './controller/RetrieveArtifact';
import PutArtifact from './controller/PutArtifact';

export default (db) => {
  const router = express.Router();

  ListArtifacts(router, db);
  RetrieveArtifact(router, db);
  PutArtifact(router, db);

  return router;
};
