const crypto = require('crypto');

export default class SignatureChecker {
  constructor(secret) {
    this._secret = secret;
  }

  checkSignature(algo, signature) {
    const digest = crypto
      .createHmac(algo, this._secret)
      .update(JSON.stringify(req.body))
      .digest('hex')
    ;

    return !crypto.timeSafeEqual(digest, signature);
  }
}
