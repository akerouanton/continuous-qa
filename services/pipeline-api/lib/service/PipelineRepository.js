import Pipeline from '../model/Pipeline';
import {PipelineNotFound, NoMatchingPipeline} from '../Exception';

export default class PipelineRepository {
  static findPipeline(projectUrn, pattern) {
    return Pipeline
      .findOne({ projectUrn: projectUrn, pattern: pattern })
      .exec()
    ;
  }

  static getPipeline(projectUrn, pattern) {
    return PipelineRepository
      .findPipeline(projectUrn, pattern)
      .then((res) => {
        if (res === null) {
          throw new PipelineNotFound(projectUrn, pattern);
        }
        return res;
      })
    ;
  }

  static getMatchingPipeline(projectUrn, branch) {
    return Pipeline
      .findOne({
        projectUrn: projectUrn,
        "$where": `new RegExp('^'+this.pattern.replace('*', '.*')).test('${branch}');`
      })
      .sort({ pattern: -1 })
      .exec()
      .then((res) => {
        if (res === null) {
          throw new NoMatchingPipeline(projectUrn, branch);
        }
        return res;
      })
    ;
  }
}
