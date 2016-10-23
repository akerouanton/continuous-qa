export function validateRunnerUrn(req, res, next, urn) {
  if (/^urn:gh:[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+:\d+:\d+:[a-zA-Z-0-9\-_]+$/.test(urn)) {
    next();
    return;
  }

  res.status(400).json({error: 'UrnNotValid'});
}
