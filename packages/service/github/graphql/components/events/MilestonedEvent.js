const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class MilestonedEvent extends Fragment {
  static get code() {
    return 'milestonedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on MilestonedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        milestoneTitle
      }
    `;
  }
};
