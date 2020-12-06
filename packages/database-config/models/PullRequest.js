const Issue = require('./Issue');

class PullRequest extends Issue {
  static get issueType() {
    return 'PULL_REQUEST';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository'],
      properties: {
        ...super.jsonSchema.properties,
        suggested_reviewers: { type: 'string', pattern: '^\\{.*\\}$' },
        additions: { type: 'number' },
        base_ref: { type: 'string', pattern: '^\\{.*\\}$' },
        base_ref_name: { type: 'string' },
        base_ref_oid: { type: 'string' },
        base_repository: { type: 'string', pattern: '^\\{.*\\}$' },
        can_be_rebased: { type: 'boolean' },
        changed_files: { type: 'number' },
        deletions: { type: 'number' },
        head_ref: { type: 'string', pattern: '^\\{.*\\}$' },
        head_ref_name: { type: 'string' },
        head_ref_oid: { type: 'string' },
        head_repository: { type: 'string', pattern: '^\\{.*\\}$' },
        head_repository_owner: { type: 'string' },
        is_cross_repository: { type: 'boolean' },
        is_draft: { type: 'boolean' },
        maintainer_can_modify: { type: 'boolean' },
        merge_commit: { type: 'string' },
        merge_state_status: { type: 'string' },
        mergeable: { type: 'boolean' },
        merged: { type: 'boolean' },
        merged_at: { type: 'string', format: 'date-time' },
        merged_by: { type: 'string' },
        permalink: { type: 'string' },
        potential_merge_commit: { type: 'string' }
      }
    };
  }
}

module.exports = PullRequest;
