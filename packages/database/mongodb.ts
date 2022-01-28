/*
 *  Author: Hudson S. Borges
 */
import urlParser from 'mongo-url-parser';
import { MongoClient } from 'mongodb';

import { CONNECTION_URL, POOL_SIZE } from './mongo-config';
import { MongoRepository } from './MongoRepository';

const { dbName } = urlParser(CONNECTION_URL);

export async function connect(): Promise<MongoClient> {
  return MongoClient.connect(CONNECTION_URL, { maxPoolSize: POOL_SIZE }).then((conn) => {
    MongoRepository.db = conn.db(dbName);
    conn.db = (providedName, options) => conn.db(providedName || dbName, options);
    return conn;
  });
}
