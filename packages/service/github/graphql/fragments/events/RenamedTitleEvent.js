/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class RenamedTitleEvent extends Fragment {
  static get code() {
    return 'renamedTitleEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on RenamedTitleEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        currentTitle
        previousTitle
      }
    `;
  }
};
