/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class ConvertedNoteToIssueEvent extends Fragment {
  static get code() {
    return 'convertedNoteToIssueEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ConvertedNoteToIssueEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
  }
};
