const Fragment = require('../Fragment');
const ActorFragment = require('./SimplifiedActorFragment');
const ReactableFragment = require('./ReactableFragment');
const MilestoneFragment = require('./MilestoneFragment');

module.exports = class IssueFragment extends Fragment {
  static get objectName() {
    return 'Issue';
  }

  static get code() {
    return 'issue';
  }

  static get dependencies() {
    return [ActorFragment, ReactableFragment];
  }

  static toString(full = true, extraFields = '') {
    return `
      fragment ${this.code} on ${this.objectName} {
        ${super.$include(full, 'activeLockReason')}
        author { ...${ActorFragment.code} }
        authorAssociation
        ${super.$include(full, 'body')}
        ${super.$include(full, 'closed')}
        closedAt
        createdAt
        createdViaEmail
        databaseId
        editor { ...${ActorFragment.code} }
        id
        ${super.$include(full, 'includesCreatedEdit')}
        lastEditedAt
        locked
        ${super.$include(full, `milestone { ...${MilestoneFragment.code} }`)}
        ${super.$include(full, 'number')}
        publishedAt
        ${super.$include(full, `...${ReactableFragment.code}`)}
        state
        title
        updatedAt
        ${extraFields}
      }
    `;
  }
};
