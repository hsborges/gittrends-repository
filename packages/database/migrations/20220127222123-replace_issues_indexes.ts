/*
 *  Author: Hudson S. Borges
 */
import { Db } from 'mongodb';

export = {
  async up(db: Db): Promise<void> {
    await Promise.all([
      db.collection('pull_requests').dropIndex('pulls_repo_error_index'),
      db.collection('issues').dropIndex('issues_repo_error_index')
    ]);

    await Promise.all([
      db
        .collection('issues')
        .createIndex(
          { repository: 1, '_metadata.error': 1, '_metadata.retry': 1 },
          { name: 'issues_repo_error_index' }
        ),
      db
        .collection('pull_requests')
        .createIndex(
          { repository: 1, '_metadata.error': 1, '_metadata.retry': 1 },
          { name: 'pulls_repo_error_index' }
        )
    ]);
  },

  async down(db: Db): Promise<void> {
    await Promise.all([
      db.collection('pull_requests').dropIndex('pulls_repo_error_index'),
      db.collection('issues').dropIndex('issues_repo_error_index')
    ]);

    await Promise.all([
      db
        .collection('issues')
        .createIndex({ repository: 1, '_metadata.error': 1 }, { name: 'issues_repo_error_index' }),
      db
        .collection('pull_requests')
        .createIndex({ repository: 1, '_metadata.error': 1 }, { name: 'pulls_repo_error_index' })
    ]);
  }
};
