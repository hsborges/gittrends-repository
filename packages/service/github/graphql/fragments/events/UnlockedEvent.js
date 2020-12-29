/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UnlockedEvent extends Fragment {
  static get code() {
    return 'unlockedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on UnlockedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
