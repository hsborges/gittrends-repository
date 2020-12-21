const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment');
const DeploymentFragment = require('./DeploymentFragment');

module.exports = class DeploymentStatusFragment extends Fragment {
  static get code() {
    return 'deploymentStatus';
  }

  static get dependencies() {
    return [ActorFragment.simplified, DeploymentFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on DeploymentStatus {
        createdAt
        creator { ...${ActorFragment.code} }
        deployment { ...${DeploymentFragment.code} }
        description
        logUrl
        state
        updatedAt
    `;
  }
};
