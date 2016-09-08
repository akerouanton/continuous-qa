import App from '../lib/App';

new App({
  amqp: {
    host: process.env.AMQP_HOST || 'localhost',
    port: process.env.AMQP_PORT || 5672,
    exchange: process.env.AMQP_EXCHANGE || 'amq.topic'
  },
  docker: {
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
  }
});
