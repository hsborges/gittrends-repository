/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class MovedColumnsInProjectEvent extends Fragment {
  static get code() {
    return 'movedColumnsInProjectEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on MovedColumnsInProjectEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        previousProjectColumnName
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
  }
};
