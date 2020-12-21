const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class MovedColumnsInProjectEvent extends Fragment {
  static get code() {
    return 'movedColumnsInProjectEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on MovedColumnsInProjectEvent {
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
