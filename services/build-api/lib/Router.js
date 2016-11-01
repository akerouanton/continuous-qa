const express = require('express');
const _ = require('underscore');

import CreateBuild from './controller/CreateBuild';
import GetBuild from './controller/GetBuild';
import GetBuildHistory from './controller/GetBuildHistory';
import UpdateTaskState from './controller/UpdateTaskState';
import RunBuild from './controller/RunBuild';
import HttpParamHandler from './service/http/ParamHandler';

const routes = {
  'CreateBuild': {method: 'post', pattern: '/builds/:projectUrn/new', handler: CreateBuild, params: ['projectUrn']},
  'GetBuild': {method: 'get', pattern: '/build/:buildUrn', handler: GetBuild, params: ['buildUrn']},
  'GetBuildHistory': {method: 'get', pattern: '/builds/:projectUrn', handler: GetBuildHistory, params: ['projectUrn']},
  'UpdateTaskState': {method: 'post', pattern: '/build/:buildUrn/:stage/:task', handler: UpdateTaskState, params: ['buildUrn', 'stage', 'task']},
  'RunBuild': {method: 'post', pattern: '/build/:buildUrn/run', handler: RunBuild, params: ['buildUrn']}
};

export default function () {
  const router = express.Router();

  for (let route of Object.keys(routes)) {
    let [method, pattern, handler,] = _.values(routes[route]);
    router[method].call(router, pattern, handler);
  }

  router.param('projectUrn', HttpParamHandler.projectUrn);
  router.param('buildUrn', HttpParamHandler.buildUrn);
  router.param('stage', HttpParamHandler.stage);
  router.param('task', HttpParamHandler.task);

  return router;
}

export function getPattern(routeName) {
  if (routes[routeName] === undefined) {
    throw new Error(`No route "${routeName}" found.`);
  }

  return routes[routeName].pattern;
}

export function generateUrl(routeName, params) {
  if (routes[routeName] === undefined) {
    throw new Error(`No route "${routeName}" found.`);
  }

  let url = routes[routeName].pattern;
  for (let param of Object.keys(params)) {
    url = url.replace(`:${param}`, encodeURIComponent(params[param]));
  }

  return url;
}

export function prependHostAndSchema(url) {
  return `${config.http_schema}://${config.http_host}/${url.replace(/^\//, '')}`;
}
