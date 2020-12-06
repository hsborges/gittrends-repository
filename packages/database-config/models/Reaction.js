const Model = require('./Model');

class Reaction extends Model {
  static get tableName() {
    return 'reactions';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository', 'issue', 'content', 'created_at', 'user'],
      properties: {
        id: { type: 'string' },
        repository: { type: 'string' },
        issue: { type: 'string' },
        event: { type: 'string' },
        content: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        user: { type: 'string' }
      }
    };
  }
}

module.exports = Reaction;
