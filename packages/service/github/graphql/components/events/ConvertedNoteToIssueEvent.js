const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class ConvertedNoteToIssueEvent extends Fragment {
  static get code() {
    return 'convertedNoteToIssueEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on ConvertedNoteToIssueEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
  }
};
