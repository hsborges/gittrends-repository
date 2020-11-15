const { Model } = require('objection');

class Watcher extends Model {
  static get tableName() {
    return 'watchers';
  }

  static get idColumn() {
    return ['repository', 'user'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['repository', 'user'],
      properties: {
        repository: { type: 'string' },
        user: { type: 'string' }
      }
    };
  }
}

module.exports = Watcher;
