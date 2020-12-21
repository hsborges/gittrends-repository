const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class LabeledEvent extends Fragment {
  static get code() {
    return 'labeledEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on LabeledEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        label { name }
      }
    `;
  }
};
