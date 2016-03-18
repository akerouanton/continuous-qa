import User from './User';

export default class {
  static createOrUpdate(profile) {
    return User
      .findOneAndUpdate({githubId: profile.githubId}, profile)
      .exec()
      .then((user) => {
        if (user === null) {
          user = new User(profile);
          return user.save();
        }

        return user;
      })
    ;
  }

  static getByGithubId(githubId) {
    return User
      .findOne({githubId: githubId})
      .exec()
    ;
  }
}
