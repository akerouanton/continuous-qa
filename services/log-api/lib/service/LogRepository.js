export default class LogRepository {
  constructor(collection) {
    this._collection = collection;
  }

  getLogs(bucketUrn) {
    return this
      ._collection
      .find({bucketUrn}, {_id: false, bucketUrn: true, log: true})
      .sort({'@timestamp': 1})
      .toArray()
    ;
  }
}
