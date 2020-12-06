const Model = require('./Model');

class TimelineEvent extends Model {
  static get tableName() {
    return 'timeline';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository', 'issue', 'type', 'payload'],
      properties: {
        id: { type: 'string' },
        repository: { type: 'string' },
        issue: { type: 'string' },
        type: { type: 'string' },
        payload: { type: 'string', pattern: '^\\{.*\\}$' }
      }
    };
  }
}

module.exports = TimelineEvent;
