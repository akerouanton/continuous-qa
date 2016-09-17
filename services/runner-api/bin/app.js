import App from '../lib/App';

new App({
  httpPort: process.env.HTTP_PORT || '8000',
  docker: {
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
  },
  labelPrefix: process.env.LABEL_PREFIX || 'com.continuousqa',
  tmpDir: process.env.TMP_DIR || '/tmp/continuousqa/artifacts'
}).run();
