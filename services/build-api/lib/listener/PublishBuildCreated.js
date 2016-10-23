import emitter from '../service/EventEmitter';

export default class PublishBuildCreated {
  static bind(deps) {
    emitter.on('build.post_save', (build) => {
      if (build.__v === 0) {
        deps.publisher.publish('build.created', {urn: build.urn})
      }
    });
  }
}
