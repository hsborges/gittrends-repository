/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class HeadRefRestoredEvent extends Fragment {
  static get code() {
    return 'headRefRestoredEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on HeadRefRestoredEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};