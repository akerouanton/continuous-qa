import App from '../lib/App';

function error(message) {
  console.error(message);
  process.exit(1);
}

new App({
  amqp: {
    host: process.env.AMQP_HOST || 'localhost',
    port: process.env.AMQP_PORT || 5672,
    exchange: process.env.AMQP_EXCHANGE || 'amq.topic'
  },
  runnerEndpoint: process.env.RUNNER_ENDPOINT || error('RUNNER_ENDPOINT should be defined.')
}).run();
