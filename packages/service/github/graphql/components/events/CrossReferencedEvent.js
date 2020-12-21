const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class CrossReferencedEvent extends Fragment {
  static get code() {
    return 'crossReferencedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on CrossReferencedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        isCrossRepository
        referencedAt
        source { type:__typename ... on Node { id } }
        target { type:__typename ... on Node { id } }
        url
        willCloseTarget
      }
    `;
  }
};
