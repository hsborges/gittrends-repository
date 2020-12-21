const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class DemilestonedEvent extends Fragment {
  static get code() {
    return 'demilestonedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on DemilestonedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        milestoneTitle
      }
    `;
  }
};
