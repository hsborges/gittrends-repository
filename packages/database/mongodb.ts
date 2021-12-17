/*
 *  Author: Hudson S. Borges
 */
import { MongoClient } from 'mongodb';

import { CONNECTION_URL, POOL_SIZE } from './mongo-config';
import { MongoRepository } from './MongoRepository';

const client = new MongoClient(CONNECTION_URL, { maxPoolSize: POOL_SIZE });

const oldConnect = client.connect.bind(client);

client.connect = async function () {
  return oldConnect().then((db) => {
    MongoRepository.db = client.db();
    return db;
  });
};

export default client;
