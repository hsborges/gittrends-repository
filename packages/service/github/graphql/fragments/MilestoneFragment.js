/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;

module.exports = class MilestoneFragment extends Fragment {
  static get code() {
    return 'milestone';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on Milestone {
        creator { ...${ActorFragment.code} }
        description
        dueOn
        id
        number
        state
        title
        url
      }
    `;
  }
};
