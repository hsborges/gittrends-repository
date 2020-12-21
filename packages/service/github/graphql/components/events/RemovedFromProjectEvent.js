const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class RemovedFromProjectEvent extends Fragment {
  static get code() {
    return 'removedFromProjectEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on RemovedFromProjectEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        project { id }
        projectColumnName
      }
    `;
  }
};
