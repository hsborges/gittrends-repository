const Model = require('./Model');

class Release extends Model {
  static get tableName() {
    return 'releases';
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
        author: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        description: { type: 'string' },
        is_draft: { type: 'boolean' },
        is_prerelease: { type: 'boolean' },
        name: { type: 'string' },
        published_at: { type: 'string', format: 'date-time' },
        release_assets_count: { type: 'number' },
        tag: { type: 'string' },
        tag_name: { type: 'string' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }
}

module.exports = Release;
