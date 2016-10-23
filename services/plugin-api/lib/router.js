const express = require('express');
const _ = require('underscore');

import {validateRegisterPlugin, handleRegisterPlugin} from './action/RegisterPlugin';
import {handleGetPlugin} from './action/GetPlugin';
import {handleListPlugins} from './action/ListPlugins';
import {handleRemovePlugin} from './action/RemovePlugin';
import {HttpServerError} from './errors';

const routes = {
  'RegisterPlugin': {
    method: 'PUT',
    pattern: '/plugin/:name',
    validator: validateRegisterPlugin,
    action: handleRegisterPlugin
  },
  'GetPlugin': {method: 'GET', pattern: '/plugin/:name', action: handleGetPlugin},
  'RemovePlugin': {method: 'DELETE', pattern: '/plugin/:patternName', action: handleRemovePlugin},
  'ListPlugins': {method: 'GET', pattern: '/plugins', action: handleListPlugins}
};

export default function router() {
  const router = express.Router();

  for (let route of Object.keys(routes)) {
    let {method: httpMethod, pattern, validator = null, action} = routes[route];
    let method = httpMethod.toLowerCase();

    if (validator !== null) {
      router[method].call(router, pattern, validator);
    }

    router[method].call(router, pattern, action);
  }

  return router;
}

export function generateUrl(routeName, params) {
  if (routes[routeName] === undefined) {
    throw new HttpServerError(`Route "${routeName}" not found.`);
  }

  let url = routes[routeName].pattern;
  const routeParams = getParameters(routeName);

  for (let param of routeParams) {
    if (params[param] === undefined) {
      throw new HttpServerError(`Route "${routeName}" cannot be generated: missing parameter "${param}".`);
    }

    url = url.replace(`:${param}`, encodeURIComponent(params[param]));
  }

  return url;
}

const _getParameters = (routeName) => {
  const route = routes[routeName];
  if (route === undefined) {
    throw new HttpServerError(`Route "${routeName}" not found.`);
  }

  const matches = /:([a-zA-Z]+)/.exec(route.pattern);
  if (matches === null) {
    return [];
  }

  matches.shift();
  return matches;
};

export const getParameters = _.memoize(_getParameters);
