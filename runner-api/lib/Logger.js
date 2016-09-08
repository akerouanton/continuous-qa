const tracer = require('tracer');

const logger = tracer.colorConsole({
  format: "{{timestamp}} <{{title}}> {{file}}:{{line}} ({{method}}) {{message}}"
});

export default logger;
