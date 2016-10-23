const logger = require('tracer').colorConsole();

import Build from '../../model/Build';
import {BuildNotFoundError} from '../../Error';

export default class {
  static get(projectUrn, buildId) {
    return Build
      .findOne({projectUrn, buildId})
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
      .find({projectUrn})
      .sort({buildId: 1})
    ;
  }
}
