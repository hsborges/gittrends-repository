const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class AssignedEvent extends Fragment {
  static get code() {
    return 'assignedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
