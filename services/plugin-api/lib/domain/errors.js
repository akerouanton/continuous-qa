import ExtendableError from 'es6-error';

export class PluginNotFoundError extends ExtendableError {
  constructor(name) {
    super(`Plugin "${name}" does not exists.`);
  }
}
