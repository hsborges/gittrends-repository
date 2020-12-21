const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class UnassignedEvent extends Fragment {
  static get code() {
    return 'unassignedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on UnassignedEvent {
        actor { ...${ActorFragment.code} }
        assignee { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
