const logger = require('winston');

import App from '../lib/App';

function error(message) {
  logger.error(message);

  process.exit(1);
}

new App({
  httpPort: process.env.HTTP_PORT || 8000,
  secret: process.env.SECRET || error('SECRET should be defined.'),
  buildEndpoint: process.env.BUILD_ENDPOINT || error('BUILD_ENDPOINT should be defined.')
}).run();
