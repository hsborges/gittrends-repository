const Issue = require('./Issue');

class PullRequest extends Issue {
  static get tableName() {
    return 'issues';
  }

  static get idColumn() {
    return 'id';
  }

  static get issueType() {
    return 'PULL_REQUEST';
  }

  static query(...args) {
    return super.query(...args).where('issues.type', this.issueType);
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.type = 'PULL_REQUEST';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'repository'],
      properties: {
        ...super.jsonSchema.properties,
        suggested_reviewers: { type: 'object' },
        additions: { type: 'number' },
        base_ref: { type: 'object' },
        base_ref_name: { type: 'string' },
        base_ref_oid: { type: 'string' },
        base_repository: { type: 'object' },
        can_be_rebased: { type: 'boolean' },
        changed_files: { type: 'number' },
        deletions: { type: 'number' },
        head_ref: { type: 'object' },
        head_ref_name: { type: 'string' },
        head_ref_oid: { type: 'string' },
        head_repository: { type: 'object' },
        head_repository_owner: { type: 'string' },
        is_cross_repository: { type: 'boolean' },
        is_draft: { type: 'boolean' },
        maintainer_can_modify: { type: 'boolean' },
        merge_commit: { type: 'string' },
        merge_state_status: { type: 'string' },
        mergeable: { type: 'boolean' },
        merged: { type: 'boolean' },
        merged_at: { type: 'object' },
        merged_by: { type: 'string' },
        permalink: { type: 'string' },
        potential_merge_commit: { type: 'string' }
      }
    };
  }
}

module.exports = PullRequest;
