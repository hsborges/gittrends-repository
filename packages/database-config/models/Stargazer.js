const Model = require('./Model');

class Stargazer extends Model {
  static get tableName() {
    return 'stargazers';
  }

  static get idColumn() {
    return ['repository', 'user', 'starred_at'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['repository', 'user', 'starred_at'],
      properties: {
        repository: { type: 'string' },
        user: { type: 'string' },
        starred_at: { type: 'string', format: 'date-time' }
      }
    };
  }
}

module.exports = Stargazer;
