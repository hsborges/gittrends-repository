/*
 *  Author: Hudson S. Borges
 */
import { Db } from 'mongodb';

export = {
  async up(db: Db): Promise<void> {
    await Promise.all([
      db
        .collection('stargazers')
        .createIndex({ repository: 1 }, { name: 'stargazers_repository_index' }),
      db
        .collection('watchers')
        .createIndex({ repository: 1 }, { name: 'watchers_repository_index' }),
      db
        .collection('dependencies')
        .createIndex({ repository: 1 }, { name: 'dependencies_repository_index' }),
      db
        .collection('actors')
        .createIndex({ '_metadata.updatedAt': 1 }, { name: '_metadata_updatedat_index' }),
      db.collection('issues').createIndex({ type: 1 }, { name: 'issues_type_index' })
    ]);
  },

  async down(db: Db): Promise<void> {
    await Promise.all([
      db.collection('issues').dropIndex('issues_type_index'),
      db.collection('actors').dropIndex('_metadata_updatedat_index'),
      db.collection('dependencies').dropIndex('dependencies_repository_index'),
      db.collection('watchers').dropIndex('watchers_repository_index'),
      db.collection('stargazers').dropIndex('stargazers_repository_index')
    ]);
  }
};
