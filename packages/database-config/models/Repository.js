const { Model } = require('objection');
const Metadata = require('./Metadata');

class Repository extends Model {
  static get tableName() {
    return 'repositories';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        assignable_users_count: { type: 'number' },
        code_of_conduct: { type: 'string' },
        contact_links: { type: 'array' },
        created_at: { type: 'object' },
        database_id: { type: 'number' },
        default_branch: { type: 'string' },
        delete_branch_on_merge: { type: 'boolean' },
        description: { type: 'string' },
        disk_usage: { type: 'number' },
        forks_count: { type: 'number' },
        funding_links: { type: 'array' },
        has_issues_enabled: { type: 'boolean' },
        has_projects_enabled: { type: 'boolean' },
        has_wiki_enabled: { type: 'boolean' },
        homepage_url: { type: 'string' },
        is_archived: { type: 'boolean' },
        is_blank_issues_enabled: { type: 'boolean' },
        is_disabled: { type: 'boolean' },
        is_empty: { type: 'boolean' },
        is_fork: { type: 'boolean' },
        is_in_organization: { type: 'boolean' },
        is_locked: { type: 'boolean' },
        is_mirror: { type: 'boolean' },
        is_private: { type: 'boolean' },
        is_security_policy_enabled: { type: 'boolean' },
        is_template: { type: 'boolean' },
        is_user_configuration_repository: { type: 'boolean' },
        issues_count: { type: 'number' },
        labels_count: { type: 'number' },
        languages: { type: 'array' },
        license_info: { type: 'string' },
        lock_reason: { type: 'string' },
        mentionable_users_count: { type: 'number' },
        merge_commit_allowed: { type: 'boolean' },
        milestones_count: { type: 'number' },
        mirror_url: { type: 'string' },
        name: { type: 'string' },
        name_with_owner: { type: 'string' },
        open_graph_image_url: { type: 'string' },
        owner: { type: 'string' },
        parent: { type: 'string' },
        primary_language: { type: 'string' },
        pushed_at: { type: 'object' },
        pull_requests_count: { type: 'number' },
        rebase_merge_allowed: { type: 'boolean' },
        releases_count: { type: 'number' },
        repository_topics: { type: 'array' },
        squash_merge_allowed: { type: 'boolean' },
        stargazers_count: { type: 'number' },
        template_repository: { type: 'string' },
        updated_at: { type: 'object' },
        url: { type: 'string' },
        uses_custom_open_graph_image: { type: 'boolean' },
        vulnerability_alerts_count: { type: 'number' },
        watchers_count: { type: 'number' }
      }
    };
  }

  static get relationMappings() {
    return {
      metadata: {
        relation: Model.HasManyRelation,
        modelClass: Metadata,
        join: { from: 'repositories.id', to: 'metadata.id' }
      }
    };
  }
}

module.exports = Repository;
