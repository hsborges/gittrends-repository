const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment');
const CommitFragment = require('./CommitFragment');

module.exports = class DeploymentFragment extends Fragment {
  static get code() {
    return 'deployment';
  }

  static get dependencies() {
    return [CommitFragment, ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on Deployment {
        commit { ...${CommitFragment.code} }
        createdAt
        creator { ...${ActorFragment.code} }
        databaseId
        environment
        id
        payload
        state
        statuses (last: 100) {
          nodes {
            creator { ...${ActorFragment.code} }
            description
            environmentUrl
            id
            logUrl
            state
          }
        }
      }
    `;
  }
};
