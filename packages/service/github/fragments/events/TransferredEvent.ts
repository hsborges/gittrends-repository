/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class TransferredEvent extends Fragment {
  code = 'transferredEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on TransferredEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        fromRepository { id nameWithOwner }
      }
    `;
  }
}

export default new TransferredEvent();
