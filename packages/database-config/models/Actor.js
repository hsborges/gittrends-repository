const { Model } = require('objection');

class Actor extends Model {
  static get tableName() {
    return 'actors';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'type', 'login'],
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
        login: { type: 'string' },
        avatar_url: { type: 'string' },

        // Users
        bio: { type: 'string' },
        company: { type: 'string' },
        followers_count: { type: 'number' },
        following_count: { type: 'number' },
        gists_count: { type: 'number' },
        is_bounty_hunter: { type: 'boolean' },
        is_campus_expert: { type: 'boolean' },
        is_developer_program_member: { type: 'boolean' },
        is_employee: { type: 'boolean' },
        is_hireable: { type: 'boolean' },
        is_site_admin: { type: 'boolean' },
        projects_count: { type: 'number' },
        projects_url: { type: 'string' },
        repositories_contributed_to_count: { type: 'number' },
        starred_repositories_count: { type: 'number' },
        status: { type: 'object' },
        watching_count: { type: 'string' },

        // Organization
        description: { type: 'string' },
        is_verified: { type: 'boolean' },
        members_with_role_count: { type: 'number' },
        teams_count: { type: 'number' },

        // EnterpriseUserAccount
        enterprise: { type: 'string' },
        user: { type: 'string' },

        // Common properties
        created_at: { type: 'object' },
        database_id: { type: 'number' },
        email: { type: 'string' },
        location: { type: 'string' },
        name: { type: 'string' },
        repositories_count: { type: 'number' },
        twitter_username: { type: 'string' },
        updated_at: { type: 'object' },
        website_url: { type: 'string' }
      }
    };
  }
}

module.exports = Actor;
