import logger from '../Logger';
import BucketParamValidator from '../BucketParamValidator';

/**
 * @api {get} /artifacts/:bucket List artifacts attached to a bucket
 * @apiName ListArtifacts
 * @apiGroup artifact-api
 * @apiVersion 0.1.0
 * @apiParam {String} bucket URN of the bucket
 * @apiSuccess {Object[]} artifacts          List of artifacts in this :bucket
 * @apiSuccess {String}   artifacts.filename Name of the artifact
 * @apiError (400) UrnNotValid         The bucket URN is not valid
 * @apiError (404) BucketNotFoundError This :bucket does not exists
 */
class Controller {
  constructor(collection) {
    this._collection = collection;
  }

  handle(req, res, next) {
    logger.debug('Request parameters:', req.params);

    this._collection
      .find({ bucket: req.params.bucket }, { '_id': false, filename: true })
      .toArray()
      .then((artifacts) => {
        if (artifacts.length === 0) {
          res.status(404).json({error: 'BucketNotFoundError'});
          return;
        }

        res.status(200).json({artifacts: artifacts});
      })
      .catch((error) => {
        next(error);
      })
    ;
  }
}

export default function (router, collection) {
  const controller = new Controller(collection);

  router.get('/:bucket', controller.handle.bind(controller));
  router.param('bucket', BucketParamValidator)
}
