const { Model } = require('objection');

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

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.type = this.issueType;
  }

  async $beforeUpdate(context) {
    await super.$beforeUpdate(context);
    this.type = this.issueType;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository'],
      properties: {
        id: { type: 'string' },
        repository: { type: 'string' },
        type: { type: 'string' },
        active_lock_reason: { type: 'string' },
        author: { type: 'string' },
        author_association: { type: 'string' },
        body: { type: 'string' },
        closed: { type: 'boolean' },
        closed_at: { type: 'object' },
        created_at: { type: 'object' },
        created_via_email: { type: 'boolean' },
        database_id: { type: 'number' },
        editor: { type: 'string' },
        includes_created_edit: { type: 'boolean' },
        last_edited_at: { type: 'object' },
        locked: { type: 'boolean' },
        milestone: { type: 'object' },
        number: { type: 'number' },
        published_at: { type: 'object' },
        state: { type: 'string' },
        title: { type: 'string' },
        assignees: { type: 'array' },
        labels: { type: 'array' },
        participants: { type: 'array' },
        reaction_groups: { type: 'object' }
      }
    };
  }
}

module.exports = Issue;
