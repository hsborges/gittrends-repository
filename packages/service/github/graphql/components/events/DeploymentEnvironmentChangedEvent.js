const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');
const DeploymentStatusFragment = require('../DeploymentStatusFragment');

module.exports = class DeploymentEnvironmentChangedEvent extends Fragment {
  static get code() {
    return 'deploymentEnvironmentChangedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified, DeploymentStatusFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on DeploymentEnvironmentChangedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        deploymentStatus { ...${DeploymentStatusFragment.code} }
      }
    `;
  }
};
