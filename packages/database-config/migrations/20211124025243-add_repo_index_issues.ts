/*
 *  Author: Hudson S. Borges
 */
import { Db } from 'mongodb';

export = {
  async up(db: Db): Promise<void> {
    await db
      .collection('issues')
      .createIndex({ repository: 1 }, { name: 'issues_repository_index' });
  },

  async down(db: Db): Promise<void> {
    await db.collection('issues').dropIndex('issues_repository_index');
  }
};
