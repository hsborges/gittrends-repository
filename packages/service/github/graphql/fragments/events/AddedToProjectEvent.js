/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class AddedToProjectEvent extends Fragment {
  static get code() {
    return 'addedToProjectEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on AddedToProjectEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
  }
};
