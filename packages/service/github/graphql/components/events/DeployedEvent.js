const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');
const DeploymentFragment = require('../DeploymentFragment');

module.exports = class DeployedEvent extends Fragment {
  static get code() {
    return 'deployedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified, DeploymentFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on DeployedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        databaseId
        deployment { ...${DeploymentFragment.code} }
        ref { name target { id } }
      }
    `;
  }
};
