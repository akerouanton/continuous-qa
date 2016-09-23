const multer = require('multer');
const Promise = require('promise');
const mmm = require('mmmagic');
const Magic = mmm.Magic;
const Buffer = require('buffer').Buffer;

import logger from '../Logger';
import {ArtifactAlreadyExistsError,EmptyUploadError} from '../Exceptions';
import BucketParamValidator from '../BucketParamValidator';

/**
 * @api {put} /artifact/:bucket/:filename Put a new artifact in a bucket
 * @apiName PutArtifact
 * @apiGroup artifact-api
 * @apiVersion 0.1.0
 * @apiParam {String} bucket   URN of the bucket
 * @apiParam {String} filename Name of the artifact to store
 * @apiParam {File}   artifact Artifact to store (<code>form-data</code> parameter)
 * @apiError (400) UrnNotValid                The bucket URN is not valid
 * @apiError (400) EmptyUploadError           No file in the "artifact" key
 * @apiError (400) ArtifactAlreadyExistsError An artifact with the same name was already attached to this :bucket
 */
export default class {
  constructor(collection) {
    this._collection = collection;
    this._uploader   = Promise.denodeify(multer({ storage: multer.memoryStorage() }).single('artifact'));

    const magic        = new Magic(mmm.MAGIC_MIME_TYPE);
    this._magic_detect = Promise.denodeify(magic.detect.bind(magic));
  }

  handle(req, res) {
    const bucket = req.params.bucket;
    const filename = req.params.filename;

    this._uploader(req, res)
      .then(() => {
        if (typeof req.file === 'undefined' || req.file === null) {
          throw new EmptyUploadError('No artifact was uploaded.');
        }

        return this._collection.findOne({bucket: bucket, filename: filename});
      })
      .then((result) => {
        if (result !== null) {
          throw new ArtifactAlreadyExistsError(bucket, filename);
        }
      })
      .then(() => {
        var buffer = req.file.buffer;
        if (buffer.constructor !== Buffer.constructor) {
          buffer = Buffer.from(req.file.buffer);
        }

        return this._magic_detect(buffer);
      })
      .then((mimeType) => {
        return this._collection.insertOne({
          bucket: bucket,
          filename: filename,
          mimeType: mimeType,
          artifact: req.file.buffer
        });
      })
      .then(() => {
        res.sendStatus(200);
        res.end();
      })
      .catch((error) => {
        if (error instanceof EmptyUploadError || error instanceof ArtifactAlreadyExistsError) {
          logger.info('Client error ' + error.name + ': "' + error.message + '".');

          res.status(400).json({error: error.name});
          return;
        }

        next(error);
      })
    ;
  }
}
