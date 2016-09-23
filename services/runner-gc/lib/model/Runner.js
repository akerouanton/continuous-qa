export default class {
  constructor(data) {
    this._name = data.name;
    this._buildUrn = data.buildUrn;
    this._analyzer = data.analyzer;
    this._mountPoint = data.mountPoint;
    this._exitCode = data.exitCode;
  }

  get name() {
    return this._name;
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
}
