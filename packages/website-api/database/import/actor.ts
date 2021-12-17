/*
 *  Author: Hudson S. Borges
 */
import { ActorRepository } from '@gittrends/database';

import { Actor } from '../types';

export default async function (id: string): Promise<Actor | null> {
  return ActorRepository.collection.findOne<Actor>(
    { _id: id },
    {
      projection: {
        _id: 0,
        id: '$_id',
        type: 1,
        login: 1,
        name: 1,
        avatar_url: 1,
        created_at: 1,
        updated_at: 1
      }
    }
  );
}
