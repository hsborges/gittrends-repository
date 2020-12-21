const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class HeadRefDeletedEvent extends Fragment {
  static get code() {
    return 'headRefDeletedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on HeadRefDeletedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        headRef { name target { id } }
        headRefName
      }
    `;
  }
};
