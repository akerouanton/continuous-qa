import Project from '../../model/Project';

export default class ProjectRepository {
  static generateBuildId(build) {
    return Project
      .findOneAndUpdate({projectUrn: build.projectUrn}, {$inc: {builds: 1}}, {upsert: true})
      .then((res) => {
        build.buildId = (res !== null ? res.builds : 0) + 1;
      })
    ;
  }
}
