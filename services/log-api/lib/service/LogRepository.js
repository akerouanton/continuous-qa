export default class LogRepository {
  constructor(collection) {
    this._collection = collection;
  }

  getLogs(analysis) {
    return this
      ._collection
      .find({analysisUrn: analysis})
      .sort({'@timestamp': 1})
      .toArray()
    ;
  }
}
