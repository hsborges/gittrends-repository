/*
 *  Author: Hudson S. Borges
 */
import { MongoClient } from 'mongodb';

import { MongoRepository } from './MongoRepository';
import { CONNECTION_URL, POOL_SIZE, DB } from './mongo-config';

const client = new MongoClient(CONNECTION_URL, {
  maxPoolSize: parseInt(POOL_SIZE, 10)
});

const oldConnect = client.connect.bind(client);

client.connect = async function () {
  return oldConnect().then((db) => {
    MongoRepository.db = client.db(DB);
    return db;
  });
};

export default client;
