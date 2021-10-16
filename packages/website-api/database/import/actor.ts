/*
 *  Author: Hudson S. Borges
 */
import { Actor as MongoActor } from '@gittrends/database-config';

export type Actor = {
  id: string;
  type: string;
  login: string;
  name: string;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
};

export default async function (id: string): Promise<Actor | null> {
  return MongoActor.collection.findOne<Actor>(
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
