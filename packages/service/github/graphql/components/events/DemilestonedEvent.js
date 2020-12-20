const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class DemilestonedEvent extends Fragment {
  static get code() {
    return 'demilestonedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
