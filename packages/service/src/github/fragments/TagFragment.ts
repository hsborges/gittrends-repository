/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import CommitFragment from './CommitFragment';

class TagFragment extends Fragment {
  code = 'tag';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, CommitFragment];
  }

  toString(): string {
    return `
    fragment ${this.code} on Tag {
      id
      message
      name
      oid
      tagger { date email name user { ...${SimplifiedActorFragment.code} } }
      target { ...${CommitFragment.code} }
    }
    `;
  }
}

export default new TagFragment();
