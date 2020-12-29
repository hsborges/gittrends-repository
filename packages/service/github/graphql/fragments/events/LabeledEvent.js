/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class LabeledEvent extends Fragment {
  static get code() {
    return 'labeledEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on LabeledEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        label { name }
      }
    `;
  }
};
