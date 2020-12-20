const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class ConnectedEvent extends Fragment {
  static get code() {
    return 'connectedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on ConnectedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        isCrossRepository
        source {
          ... on Issue { id type:__typename }
          ... on PullRequest { id type:__typename }
        }
        subject {
          ... on Issue { id type:__typename }
          ... on PullRequest { id type:__typename }
        }
      }
    `;
  }
};
