import App from '../lib/App';

new App({
  docker: {
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
    containerLabel: process.env.CONTAINER_LABEL || 'com.continuousqa.runner'
  }
}).run();
