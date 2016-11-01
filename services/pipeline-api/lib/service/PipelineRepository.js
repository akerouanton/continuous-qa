import Pipeline from '../model/Pipeline';
import {PipelineNotFound, NoMatchingPipeline} from '../errors';

export default class PipelineRepository {
  static upsert(pipeline) {
    const {projectUrn, pattern, stages} = pipeline;

    return Pipeline
      .findOneAndUpdate({projectUrn, pattern}, {stages})
      .exec()
      .then((result) => {
        if (result === null) {
          pipeline.save();
          pipeline.isNew = true;
          return pipeline;
        }

        return result;
      })
    ;
  }

  static get(projectUrn, pattern) {
    return Pipeline
      .findOne({projectUrn, pattern})
      .exec()
      .then((res) => {
        if (res === null) {
          throw new PipelineNotFound(projectUrn, pattern);
        }
        return res;
      })
    ;
  }

  static find(projectUrn) {
    return Pipeline.find({projectUrn}).exec();
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
