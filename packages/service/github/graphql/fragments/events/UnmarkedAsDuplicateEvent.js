/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UnmarkedAsDuplicateEvent extends Fragment {
  static get code() {
    return 'unmarkedAsDuplicateEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on UnmarkedAsDuplicateEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
