const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class UnlabeledEvent extends Fragment {
  static get code() {
    return 'unlabeledEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on UnlabeledEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        label { name }
      }
    `;
  }
};
