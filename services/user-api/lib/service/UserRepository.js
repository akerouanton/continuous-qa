import User from '../model/User';

export function upsert(profile) {
  const {githubId, name} = profile;

  return User
    .findOneAndUpdate({githubId}, {githubId, name})
    .exec()
    .then(user => user === null ? new User(profile).save() : user)
  ;
}

export function getByGithubId(githubId) {
  return User.findOne({githubId}).exec();
}
