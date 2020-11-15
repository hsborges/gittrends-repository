const { Model } = require('objection');

class Metadata extends Model {
  static get tableName() {
    return 'metadata';
  }

  static get idColumn() {
    return ['id', 'resource', 'key'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'resource', 'key'],
      properties: {
        id: { type: 'string' },
        resource: { type: 'string' },
        key: { type: 'string' },
        value: { type: 'string' }
      }
    };
  }
}

module.exports = Metadata;
