const ActorFragment = require('./ActorFragment');

module.exports = class SimplifiedActorFragment extends ActorFragment {
  static get code() {
    return 'simplifiedActor';
  }

  static toString() {
    return super.toString(false);
  }
};
