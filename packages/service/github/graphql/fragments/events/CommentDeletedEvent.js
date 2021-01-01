/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class CommentDeletedEvent extends Fragment {
  static get code() {
    return 'commentDeletedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on CommentDeletedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};