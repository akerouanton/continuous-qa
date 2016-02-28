module.exports.log = (msg) => {
  console.log(msg);
};

module.exports.error = (msg) => {
  console.error(msg);

  if (msg.stack !== undefined) {
    console.error(msg.stack);
  }
};
