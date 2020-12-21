const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class AssignedEvent extends Fragment {
  static get code() {
    return 'assignedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on AssignedEvent {
        actor { ...${ActorFragment.code} }
        assignee { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
