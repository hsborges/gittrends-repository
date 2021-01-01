/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class SubscribedEvent extends Fragment {
  static get code() {
    return 'subscribedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on SubscribedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};