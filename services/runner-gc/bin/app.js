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
  buildEndpoint: process.env.PATCH_BUILD_ENDPOINT || error('PATCH_BUILD_ENDPOINT should be defined.'),
  artifactEndpoint: process.env.PUT_ARTIFACT_ENDPOINT || error('PUT_ARTIFACT_ENDPOINT should be defined.'),
  labelPrefix: process.env.LABEL_PREFIX || 'com.continuousqa',
  artifactsTmpDir: process.env.ARTIFACTS_TMP_DIR || '/tmp',
  runnerEndpoint: process.env.RUNNER_ENDPOINT || 'http://continuousqa_nginx_1/runner'
}).run();
