const logger = require('tracer').console();
const multer = require('multer');
const Promise = require('promise');
const mmm = require('mmmagic');
const Magic = mmm.Magic;

class FileAlreadyExistsError {
  constructor(urn, filename) {
    const message = 'File /' + urn + '/' + filename + ' already exists.';

    this.name = 'FileAlreadyExistsError';
    this.message = message;
    this.stack = Error.captureStackTrace(this, this.constructor);
  }
}
FileAlreadyExistsError.prototype = Error.prototype;

class EmptyUploadError {
  constructor(message) {
    this.name = 'EmptyUploadError';
    this.message = message;
    this.stack = Error.captureStackTrace(this, this.constructor);
  }
}
EmptyUploadError.prototype = Error.prototype;

class Controller {
  constructor(db) {
    this._db       = db;
    this._uploader = Promise.denodeify(multer({ storage: multer.memoryStorage() }).single('artifact'));

    const magic        = new Magic(mmm.MAGIC_MIME_TYPE);
    this._magic_detect = Promise.denodeify(magic.detect.bind(magic));
  }

  handle(req, res) {
    const urn = req.params.urn;
    const filename = req.params.filename;
    const collection = this._db.collection('artifacts');

    this._uploader(req, res)
      .then(() => {
        if (typeof req.file === 'undefined' || req.file === null) {
          throw new EmptyUploadError('No file was uploaded.');
        }

        return collection.findOne({urn: urn, filename: filename});
      })
      .then((result) => {
        if (result !== null) {
          throw new FileAlreadyExistsError(urn, filename);
        }
      })
      .then(() => {
        return this._magic_detect(req.file.buffer);
      })
      .then((mimeType) => {
        return collection.insertOne({
          urn: urn,
          filename: filename,
          mimeType: mimeType,
          artifact: req.file.buffer
        });
      })
      .then(() => {
        res.sendStatus(200);
        res.end();
      })
      .catch((err) => {
        if (err instanceof EmptyUploadError || err instanceof FileAlreadyExistsError) {
          res.status(400).end(JSON.stringify({error: err.name}));
          return;
        }

        next(err);
      })
    ;
  }
}

export default function (router, db) {
  const controller = new Controller(db);

  /**
   * @api {put} /:urn/:filename Put a new artifact
   * @apiName PutArtifact
   * @apiGroup artifact-api
   * @apiVersion 0.1.0
   * @apiParam {String} urn URN of the bucket
   * @apiParam {String} filename Name of the file to store
   * @apiError EmptyUploadError Either no file were provided, or it was not in the artifact key
   * @apiError FileAlreadyExistsError A file with the same name was already attached to this :urn
   */
  router.put('/:urn/:filename', controller.handle);
}
