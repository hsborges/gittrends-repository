const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class CommentDeletedEvent extends Fragment {
  static get code() {
    return 'commentDeletedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on CommentDeletedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
