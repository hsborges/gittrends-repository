const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class MentionedEvent extends Fragment {
  static get code() {
    return 'mentionedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on MentionedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
