const Model = require('./Model');

class Dependency extends Model {
  static get tableName() {
    return 'dependencies';
  }

  static get idColumn() {
    return ['repository', 'manifest', 'package_name'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['repository', 'manifest', 'package_name'],
      properties: {
        repository: { type: 'string' },
        manifest: { type: 'string' },
        filename: { type: 'string' },
        blob_path: { type: 'string' },
        has_dependencies: { type: 'boolean' },
        package_manager: { type: 'string' },
        package_name: { type: 'string' },
        target_repository: { type: 'string', pattern: '^\\{.*\\}$' },
        requirements: { type: 'string' }
      }
    };
  }
}

module.exports = Dependency;
