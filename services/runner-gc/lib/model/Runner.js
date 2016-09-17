export default class {
  constructor(data) {
    this._containerId = data.containerId;
    this._buildUrn = data.buildUrn;
    this._analyzer = data.analyzer;
    this._mountPoint = data.mountPoint;
    this._exitCode = data.exitCode;
    this._containerName = data.containerName;
  }

  get containerId() {
    return this._containerId;
  }

  get buildUrn() {
    return this._buildUrn;
  }

  get analyzer() {
    return this._analyzer;
  }

  get mountPoint() {
    return this._mountPoint;
  }

  get exitCode() {
    return this._exitCode;
  }

  get containerName() {
    return this._containerName;
  }
}
