const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class ConvertToDraftEvent extends Fragment {
  static get code() {
    return 'convertToDraftEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on ConvertToDraftEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
