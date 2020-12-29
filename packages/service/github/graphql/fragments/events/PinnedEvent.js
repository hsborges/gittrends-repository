/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class PinnedEvent extends Fragment {
  static get code() {
    return 'pinnedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on PinnedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
