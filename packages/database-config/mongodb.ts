/*
 *  Author: Hudson S. Borges
 */
import { MongoClient } from 'mongodb';
import Model from './models/Model';

const HOST = process.env.GITTRENDS_DATABASE_HOST ?? 'localhost';
const PORT = process.env.GITTRENDS_DATABASE_PORT ?? '27017';
const DB = process.env.GITTRENDS_DATABASE_DB ?? 'gittrends_app-development';
const USERNAME = process.env.GITTRENDS_DATABASE_USERNAME;
const PASSWORD = process.env.GITTRENDS_DATABASE_PASSWORD;
const POOL_SIZE = process.env.GITTRENDS_DATABASE_POOL_SIZE ?? '5';

const client = new MongoClient(
  USERNAME
    ? `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}?authMechanism=DEFAULT`
    : `mongodb://${HOST}:${PORT}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: parseInt(POOL_SIZE, 10)
  }
);

const oldConnect = client.connect.bind(client);
client.connect = async function () {
  return oldConnect().then((db) => {
    Model.db = client.db(DB);
    return db;
  });
};

export default client;
