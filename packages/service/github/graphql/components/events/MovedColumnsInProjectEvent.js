const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class MovedColumnsInProjectEvent extends Fragment {
  static get code() {
    return 'movedColumnsInProjectEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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