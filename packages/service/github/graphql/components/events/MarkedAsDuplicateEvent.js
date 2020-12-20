const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class MarkedAsDuplicateEvent extends Fragment {
  static get code() {
    return 'markedAsDuplicateEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on MarkedAsDuplicateEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};