const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class TransferredEvent extends Fragment {
  static get code() {
    return 'transferredEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on TransferredEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        fromRepository { id nameWithOwner }
      }
    `;
  }
};
