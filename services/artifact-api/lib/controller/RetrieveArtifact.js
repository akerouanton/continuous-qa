import logger from '../Logger';
import BucketParamValidator from '../BucketParamValidator';

/**
 * @api {get} /artifact/:bucket/:filename Retrieve an artifact in a bucket
 * @apiName RetrieveArtifact
 * @apiGroup artifact-api
 * @apiVersion 0.1.0
 * @apiParam {String} bucket URN of the bucket
 * @apiParam {String} filename Name of the artifact to retrieve
 * @apiError (400) UrnNotValid           The bucket URN is not valid
 * @apiError (404) ArtifactNotFoundError
 */
export default class {
  constructor(collection) {
    this._collection =  collection;
  }

  handle(req, res, next) {
    this._collection
      .findOne({ bucket: req.params.bucket, filename: req.params.filename }, { _id: false, bucket: false, filename: false })
      .then((artifact) => {
        if (artifact === null) {
          res.status(404).json({ error: 'ArtifactNotFoundError' });
          return;
        }

        res
          .status(200)
          .set('Content-Type', artifact.mimeType)
          .end(artifact.artifact.buffer)
        ;
      })
      .catch((error) => {
        next(error);
      })
    ;
  }
}
