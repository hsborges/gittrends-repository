/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class ConvertToDraftEvent extends Fragment {
  static get code() {
    return 'convertToDraftEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ConvertToDraftEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};