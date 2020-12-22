const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UnlabeledEvent extends Fragment {
  static get code() {
    return 'unlabeledEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on UnlabeledEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        label { name }
      }
    `;
  }
};
