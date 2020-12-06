const Model = require('./Model');

class Issue extends Model {
  static get tableName() {
    return 'issues';
  }

  static get idColumn() {
    return 'id';
  }

  static get issueType() {
    return 'ISSUE';
  }

  static query(...args) {
    return super.query(...args).where('issues.type', this.issueType);
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository'],
      properties: {
        id: { type: 'string' },
        repository: { type: 'string' },
        type: { type: 'string', const: this.issueType, default: this.issueType },
        active_lock_reason: { type: 'string' },
        author: { type: 'string' },
        author_association: { type: 'string' },
        body: { type: 'string' },
        closed: { type: 'boolean' },
        closed_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        created_via_email: { type: 'boolean' },
        database_id: { type: 'number' },
        editor: { type: 'string' },
        includes_created_edit: { type: 'boolean' },
        last_edited_at: { type: 'string', format: 'date-time' },
        locked: { type: 'boolean' },
        milestone: { type: 'string', pattern: '^\\{.*\\}$' },
        number: { type: 'number' },
        published_at: { type: 'string', format: 'date-time' },
        state: { type: 'string' },
        title: { type: 'string' },
        assignees: { type: 'string', pattern: '^\\[.*\\]$' },
        labels: { type: 'string', pattern: '^\\[.*\\]$' },
        participants: { type: 'string', pattern: '^\\[.*\\]$' },
        reaction_groups: { type: 'string', pattern: '^\\{.*\\}$' }
      }
    };
  }
}

module.exports = Issue;
