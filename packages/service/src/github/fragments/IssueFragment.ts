/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import ReactableFragment from './ReactableFragment';
import MilestoneFragment from './MilestoneFragment';

export class IssueFragment extends Fragment {
  code = 'issue';
  full = true;

  constructor(simplified = false) {
    super();
    this.code = 'sIssue';
    this.full = !simplified;
  }

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, ...(this.full ? [ReactableFragment, MilestoneFragment] : [])];
  }

  get objectName(): string {
    return 'Issue';
  }

  get additionalProperties(): string {
    return '';
  }

  toString(): string {
    return `
      fragment ${this.code} on ${this.objectName} {
        ${Fragment.include(this.full, 'activeLockReason')}
        author { ...${SimplifiedActorFragment.code} }
        authorAssociation
        ${Fragment.include(this.full, 'body')}
        ${Fragment.include(this.full, 'closed')}
        closedAt
        createdAt
        createdViaEmail
        databaseId
        editor { ...${SimplifiedActorFragment.code} }
        id
        ${Fragment.include(this.full, 'includesCreatedEdit')}
        lastEditedAt
        locked
        ${Fragment.include(this.full, `milestone { ...${MilestoneFragment.code} }`)}
        number
        publishedAt
        ${Fragment.include(this.full, `...${ReactableFragment.code}`)}
        state
        title
        updatedAt
        ${this.additionalProperties}
      }
    `;
  }
}

export default new IssueFragment();
export const SimplifiedIssueFragment = new IssueFragment(true);
