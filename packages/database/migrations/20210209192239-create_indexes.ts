/*
 *  Author: Hudson S. Borges
 */
import { Db } from 'mongodb';

export = {
  async up(db: Db): Promise<void> {
    await Promise.all([
      db
        .collection('stargazers')
        .createIndex({ '_id.repository': 1 }, { name: 'stargazers_repo_index' }),
      db
        .collection('watchers')
        .createIndex({ '_id.repository': 1 }, { name: 'watchers_repo_index' }),
      db
        .collection('dependencies')
        .createIndex({ '_id.repository': 1 }, { name: 'dependencies_repo_index' }),
      db.collection('issues').createIndex({ repository: 1 }, { name: 'issues_repo_index' }),
      db.collection('pull_requests').createIndex({ repository: 1 }, { name: 'pulls_repo_index' })
    ]);
  },

  async down(db: Db): Promise<void> {
    await Promise.all([
      db.collection('pull_requests').dropIndex('pulls_repo_index'),
      db.collection('issues').dropIndex('issues_repo_index'),
      db.collection('actors').dropIndex('_metadata_updatedat_index'),
      db.collection('dependencies').dropIndex('dependencies_repo_index'),
      db.collection('watchers').dropIndex('watchers_repo_index'),
      db.collection('stargazers').dropIndex('stargazers_repo_index')
    ]);
  }
};
