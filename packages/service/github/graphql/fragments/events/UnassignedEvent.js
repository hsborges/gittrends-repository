/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UnassignedEvent extends Fragment {
  static get code() {
    return 'unassignedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on UnassignedEvent {
        actor { ...${ActorFragment.code} }
        assignee { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
