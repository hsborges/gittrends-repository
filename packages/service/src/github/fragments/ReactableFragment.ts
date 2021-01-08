/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';

class ReactableFragment extends Fragment {
  code = 'reactable';

  toString(): string {
    return `
      fragment ${this.code} on Reactable {
        reactionGroups {
          content
          createdAt
          users { totalCount }
        }
      }
    `;
  }
}

export default new ReactableFragment();
