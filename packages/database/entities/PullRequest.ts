/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Issue from './Issue';

export default class PullRequest extends Issue {
  static readonly __collection = 'pull_requests';

  suggested_reviewers?: Array<string>;
  additions?: number;
  base_ref?: { name?: string; target?: string };
  base_ref_name?: string;
  base_ref_oid?: string;
  base_repository?: string;
  can_be_rebased?: boolean;
  changed_files?: number;
  deletions?: number;
  head_ref?: { name?: string; target?: string } | string;
  head_ref_name?: string;
  head_ref_oid?: string;
  head_repository?: string;
  head_repository_owner?: string;
  is_cross_repository?: boolean;
  is_draft?: boolean;
  maintainer_can_modify?: boolean;
  merge_commit?: string;
  merge_state_status?: string;
  mergeable?: boolean;
  merged?: boolean;
  merged_at?: Date;
  merged_by?: string;
  permalink?: string;
  potential_merge_commit?: string;

  public get __schema(): Joi.ObjectSchema<PullRequest> {
    return super.__schema.append<PullRequest>({
      suggested_reviewers: Joi.array().items(Joi.string()),
      additions: Joi.number(),
      base_ref: Joi.object({
        name: Joi.string(),
        target: Joi.string()
      }),
      base_ref_name: Joi.string(),
      base_ref_oid: Joi.string(),
      base_repository: Joi.string(),
      can_be_rebased: Joi.boolean(),
      changed_files: Joi.number(),
      deletions: Joi.number(),
      head_ref: Joi.alternatives(
        Joi.string(),
        Joi.object({ name: Joi.string(), target: Joi.string() })
      ),
      head_ref_name: Joi.string(),
      head_ref_oid: Joi.string(),
      head_repository: Joi.string(),
      head_repository_owner: Joi.string(),
      is_cross_repository: Joi.boolean(),
      is_draft: Joi.boolean(),
      maintainer_can_modify: Joi.boolean(),
      merge_commit: Joi.string(),
      merge_state_status: Joi.string(),
      mergeable: Joi.boolean(),
      merged: Joi.boolean(),
      merged_at: Joi.date(),
      merged_by: Joi.string(),
      permalink: Joi.string(),
      potential_merge_commit: Joi.string()
    });
  }
}
