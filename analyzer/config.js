module.exports = {
  amqp: {
    host: process.env.AMQP_HOST || 'localhost',
    port: process.env.AMQP_PORT || 5672
  },
  docker: {
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
  }
};
