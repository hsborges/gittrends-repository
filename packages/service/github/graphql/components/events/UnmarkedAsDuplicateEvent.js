const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class UnmarkedAsDuplicateEvent extends Fragment {
  static get code() {
    return 'unmarkedAsDuplicateEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on UnmarkedAsDuplicateEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
