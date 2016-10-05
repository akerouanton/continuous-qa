import Build from '../model/Build';
import {BuildNotFoundError} from '../Exception';

export default class {
  static get(projectUrn, buildId) {
    return Build
      .findOne({projectUrn: projectUrn, buildId: buildId})
      .then((build) => {
        if (build === null) {
          throw new BuildNotFoundError(projectUrn, buildId);
        }
        return build;
      })
    ;
  }

  static findAll(projectUrn) {
    return Build
      .find({projectUrn: projectUrn})
      .sort({buildId: 1})
    ;
  }
}
