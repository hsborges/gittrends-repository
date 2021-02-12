/*
 *  Author: Hudson S. Borges
 */
import tunnel from 'tunnel-ssh';
import { Server } from 'net';
import { readFileSync } from 'fs';
import { promisify } from 'util';
import { MongoClient } from 'mongodb';

import Model from './models/Model';

const tunnelAsync = promisify(tunnel);

const HOST = process.env.GITTRENDS_DATABASE_HOST ?? 'localhost';
const PORT = process.env.GITTRENDS_DATABASE_PORT ?? '27017';
const DB = process.env.GITTRENDS_DATABASE_DB ?? 'gittrends_app-development';
const USERNAME = process.env.GITTRENDS_DATABASE_USERNAME;
const PASSWORD = process.env.GITTRENDS_DATABASE_PASSWORD;
const POOL_SIZE = process.env.GITTRENDS_DATABASE_POOL_SIZE ?? '5';

const TUNNEL = {
  HOST: process.env.GITTRENDS_TUNEL_HOST,
  PORT: parseInt(process.env.GITTRENDS_TUNEL_PORT ?? '22', 10),
  USERNAME: process.env.GITTRENDS_TUNEL_USERNAME,
  PASSWORD: process.env.GITTRENDS_TUNEL_PASSWORD,
  PRIVATE_KEY: process.env.GITTRENDS_TUNEL_PRIVATE_KEY,
  PASSPHRASE: process.env.GITTRENDS_TUNEL_PASSPHRASE,
  DST_HOST: process.env.GITTRENDS_TUNEL_DST_HOST,
  DST_PORT: parseInt(process.env.GITTRENDS_TUNEL_DST_PORT ?? PORT, 10),
  LOCAL_HOST: process.env.GITTRENDS_TUNEL_LOCAL_HOST,
  LOCAL_PORT: parseInt(process.env.GITTRENDS_TUNEL_LOCAL_PORT ?? PORT, 10)
};

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

let server: Server;
const oldConnect = client.connect.bind(client);
const oldClose = client.close.bind(client);

client.connect = async function () {
  if (TUNNEL.HOST) {
    server = await tunnelAsync({
      host: TUNNEL.HOST,
      port: TUNNEL.PORT,
      username: TUNNEL.USERNAME,
      ...(TUNNEL.PASSWORD
        ? { password: TUNNEL.PASSWORD }
        : {
            privateKey: readFileSync(TUNNEL.PRIVATE_KEY).toString('utf8').trim(),
            passphrase: TUNNEL.PASSPHRASE
          }),
      dstHost: TUNNEL.DST_HOST,
      dstPort: TUNNEL.DST_PORT,
      localHost: TUNNEL.LOCAL_HOST,
      localPort: TUNNEL.DST_PORT,
      keepAlive: true,
      agent: process.env.SSH_AUTH_SOCK
    });
  }

  return oldConnect().then((db) => {
    Model.db = client.db(DB);
    return db;
  });
};

client.close = async function () {
  await new Promise((resolve, reject) =>
    server.close(() => oldClose().then(resolve).catch(reject))
  );
};

export default client;
