const amqp     = require('amqp');
const config   = require('./config');
const logger   = require('./lib/logger');
const Analysis = require('./lib/Analysis');
const Runner   = require('./lib/Runner');

const connection = amqp.createConnection(config.amqp);
const runner = new Runner(config.docker);

connection.on('error', logger.error);
connection.on('ready', () => {
  logger.log('Connection ready.');

  connection.queue('analyzer', {'durable': true}, (queue) => {
    queue.bind('amq.direct', 'run_analysis');

    logger.log('Analyser queue declared, binding done.');

    queue.subscribe(onMessageReceived);
  });
});

const onMessageReceived = (message) => {
  logger.log('New message received.');

  try {
    const analysis = new Analysis(
      message.build_id,
      message.project_name,
      message.project_url,
      message.analyzer,
      runner
    );

    analysis.run();
  } catch (e) {
    logger.error(e);
  }
};

process.on('SIGTERM', () => {
  connection.disconnect();
  process.exit(0);
});
