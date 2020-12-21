const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class RenamedTitleEvent extends Fragment {
  static get code() {
    return 'renamedTitleEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on RenamedTitleEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        currentTitle
        previousTitle
      }
    `;
  }
};
