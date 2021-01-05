/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

class ReleaseFragment extends Fragment {
  code = 'release';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
    fragment ${this.code} on Release {
      author { ...${SimplifiedActorFragment.code} }
      createdAt
      description
      id
      isDraft
      isPrerelease
      name
      publishedAt
      releaseAssets { totalCount }
      tag { id }
      tagName
      updatedAt
    }
    `;
  }
}

export default new ReleaseFragment();
