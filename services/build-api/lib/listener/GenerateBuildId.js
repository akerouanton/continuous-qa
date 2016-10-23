import emitter from '../service/EventEmitter';
import ProjectRepository from '../service/repository/Project';

export default class GenerateBuildId {
  static bind() {
    emitter.on('build.pre_validate', GenerateBuildId.handle);
  }

  static handle(build, next) {
    if (build.__v !== undefined) {
      return next();
    }

    ProjectRepository
      .generateBuildId(build)
      .then(() => next())
      .catch(err => next(err))
    ;
  }
}
