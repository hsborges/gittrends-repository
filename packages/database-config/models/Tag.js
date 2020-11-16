const { Model } = require('objection');

class Tag extends Model {
  static get tableName() {
    return 'tags';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository', 'name', 'target'],
      properties: {
        id: { type: 'string' },
        repository: { type: 'string' },
        name: { type: 'string' },
        target: { type: 'string' },
        oid: { type: 'string' },
        message: { type: 'string' },
        tagger: { type: 'object' }
      }
    };
  }
}

module.exports = Tag;
