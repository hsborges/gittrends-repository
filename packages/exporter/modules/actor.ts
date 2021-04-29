/*
 *  Author: Hudson S. Borges
 */
import { join } from 'path';
import { Actor } from '@gittrends/database-config';

export default async function (id: string, writer: WriterFunction): Promise<void> {
  const actor = await Actor.collection.findOne(
    { _id: id },
    {
      projection: {
        _id: 0,
        type: 1,
        login: 1,
        name: 1,
        avatar_url: 1,
        created_at: 1,
        updated_at: 1
      }
    }
  );

  if (!actor) throw new Error(`Actor "${id}" , not found!`);

  writer(actor, join(actor.login, 'actor.json'));
}
