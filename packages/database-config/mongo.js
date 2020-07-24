/*
 *  Author: Hudson S. Borges
 */
const { MongoClient } = require('mongodb');

class Connection {
  static get isConnected() {
    return this.db && this.client && this.client.isConnected();
  }

  static async connect() {
    if (this.isConnected) return this.db;
    this.url = `mongodb://${this.config.host}:${this.config.port}/${this.config.db}`;
    this.client = await MongoClient.connect(this.url, this.options);

    this.db = this.client.db();
    this.commits = this.db.collection('Commits');
    this.dependencies = this.db.collection('Dependencies');
    this.issues = this.db.collection('Issues');
    this.pulls = this.db.collection('PullRequests');
    this.reactions = this.db.collection('Reactions');
    this.releases = this.db.collection('Releases');
    this.repositories = this.db.collection('Repositories');
    this.stargazers = this.db.collection('Stargazers');
    this.tags = this.db.collection('Tags');
    this.timeline = this.db.collection('Timeline');
    this.users = this.db.collection('Users');
    this.watchers = this.db.collection('Watchers');

    return this.db;
  }

  static async disconnect() {
    if (this.isConnected) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

Connection.client = null;
Connection.db = null;
Connection.config = {
  host: process.env.GITTRENDS_MONGO_HOST || 'localhost',
  port: process.env.GITTRENDS_MONGO_PORT || 27017,
  db: process.env.GITTRENDS_MONGO_DB || 'gittrends_app-development'
};
Connection.options = {
  poolSize: process.env.GITTRENDS_MONGO_POOL_SIZE || 5,
  connectTimeoutMS: process.env.GITTRENDS_MONGO_CONNECT_TIMEOUT_MS || 30000,
  socketTimeoutMS: process.env.GITTRENDS_MONGO_SOCKET_TIMEOUT_MS || 360000,
  promiseLibrary: global.Promise,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

module.exports = Connection;
