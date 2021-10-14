/*
 *  Author: Hudson S. Borges
 */
import { Actor as MongoActor } from '@gittrends/database-config';

import { Actor } from '../../models';

export default async function (id: string): Promise<Actor | null> {
  const document = await MongoActor.collection.findOne(
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

  return document && new Actor(document);
}
