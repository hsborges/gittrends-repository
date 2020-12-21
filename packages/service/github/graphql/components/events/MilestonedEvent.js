const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class MilestonedEvent extends Fragment {
  static get code() {
    return 'milestonedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
