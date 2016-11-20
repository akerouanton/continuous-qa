export function publishEvent(exchange, name, payload, user = null) {
  const headers = {};
  const message = JSON.stringify(payload);

  if (user !== null) {
    headers['X-CQA-User'] = user;
  }

  return exchange.publish(name, message, {contentType: 'application/json', headers, deliveryMode: 2});
}
