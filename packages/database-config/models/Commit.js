const Model = require('./Model');

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
        author: { type: 'string', pattern: '^\\{.*\\}$' },
        authored_by_committer: { type: 'boolean' },
        authored_date: { type: 'string', format: 'date-time' },
        changed_files: { type: 'number' },
        comments_count: { type: 'number' },
        committed_date: { type: 'string', format: 'date-time' },
        committed_via_web: { type: 'boolean' },
        committer: { type: 'string', pattern: '^\\{.*\\}$' },
        deletions: { type: 'number' },
        message: { type: 'string' },
        message_body: { type: 'string' },
        oid: { type: 'string' },
        pushed_date: { type: 'string', format: 'date-time' },
        signature: { type: 'string', pattern: '^\\{.*\\}$' },
        status: { type: 'string', pattern: '^\\{.*\\}$' }
      }
    };
  }
}

module.exports = Commit;
