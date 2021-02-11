import { Db } from 'mongodb';

export = {
  async up(db: Db): Promise<void> {
    Promise.all([
      db
        .collection('stargazers')
        .createIndex([{ key: { repository: 1 }, name: 'stargazers_repository_index' }]),
      db
        .collection('watchers')
        .createIndex([{ key: { repository: 1 }, name: 'watchers_repository_index' }]),
      db
        .collection('dependencies')
        .createIndex([{ key: { repository: 1 }, name: 'dependencies_repository_index' }]),
      db.collection('issues').createIndex([{ key: { type: 1 }, name: 'issues_type_index' }])
    ]);
  },

  async down(db: Db): Promise<void> {
    await Promise.all([
      db.collection('issues').dropIndex('issues_type_index'),
      db.collection('dependencies').dropIndex('dependencies_repository_index'),
      db.collection('watchers').dropIndex('watchers_repository_index'),
      db.collection('stargazers').dropIndex('stargazers_repository_index')
    ]);
  }
};
