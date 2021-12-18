/*
 *  Author: Hudson S. Borges
 */
import urlParser from 'mongo-url-parser';
import { MongoClient } from 'mongodb';

import { CONNECTION_URL, POOL_SIZE } from './mongo-config';
import { MongoRepository } from './MongoRepository';

const { dbName } = urlParser(CONNECTION_URL);
const client = new MongoClient(CONNECTION_URL, { maxPoolSize: POOL_SIZE });

const oldConnect = client.connect.bind(client);
const oldDb = client.db.bind(client);

client.connect = async function () {
  return oldConnect().then((db) => {
    MongoRepository.db = client.db(dbName);
    return db;
  });
};

client.db = function (providedDbName, options) {
  return oldDb(providedDbName ?? dbName, options);
};

export default client;
