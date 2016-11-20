const crypto = require('crypto');
const config = require('config');

export function checkSignature(algo, signature, body) {
  const digest = crypto
    .createHmac(algo, config.secret)
    .update(JSON.stringify(body))
    .digest('hex')
  ;

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
