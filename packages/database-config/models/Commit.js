const { Model } = require('objection');

class Commit extends Model {
  static get tableName() {
    return 'commits';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository'],
      properties: {
        id: { type: 'string' },
        repository: { type: 'string' },
        additions: { type: 'number' },
        author: { type: 'object' },
        authored_by_committer: { type: 'boolean' },
        authored_date: { type: 'object' },
        changed_files: { type: 'number' },
        comments_count: { type: 'number' },
        committed_date: { type: 'object' },
        committed_via_web: { type: 'boolean' },
        committer: { type: 'object' },
        deletions: { type: 'number' },
        message: { type: 'string' },
        message_body: { type: 'string' },
        oid: { type: 'string' },
        pushed_date: { type: 'object' },
        signature: { type: 'object' },
        status: { type: 'object' }
      }
    };
  }
}

module.exports = Commit;
