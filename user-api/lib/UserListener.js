import User from './User';

export default class {
  constructor(exchange) {
    this._exchange = exchange;

    User.schema.post('save', this.onUserCreated.bind(this));
    User.schema.post('findOneAndUpdate', (user) => {
      console.log('kikou', user);
      if (user === null/* || !user.isModified()*/) {
        return;
      }

      console.log('post update', user);

      this.onUserUpdated(user);
    });
  }

  onUserCreated(user) {
    console.log('publish amqp message', 'user_profile.created', {githubId: user.githubId});
    this
      ._exchange
      .publish('user_profile.created', {githubId: user.githubId}, {mandatory: true, contentType: 'application/json'})
    ;
  }

  onUserUpdated(user) {
    console.log('publish amqp message', 'user_profile.updated', {githubId: user.githubId});
    this
      ._exchange
      .publish('user_profile.updated', {githubId: user.githubId}, {mandatory: true, contentType: 'application/json'})
    ;
  }
}
