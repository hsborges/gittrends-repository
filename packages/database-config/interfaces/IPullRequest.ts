/* eslint-disable @typescript-eslint/ban-types */
/** @additionalProperties false */
import IIssue from './IIssue';

export default interface IPullRequest extends IIssue {
  suggested_reviewers?: string[];
  additions?: number;
  base_ref?: { name?: string; target?: string };
  base_ref_name?: string;
  base_ref_oid?: string;
  base_repository?: string;
  can_be_rebased?: boolean;
  changed_files?: number;
  deletions?: number;
  head_ref?: { name?: string; target?: string };
  head_ref_name?: string;
  head_ref_oid?: string;
  head_repository?: string;
  head_repository_owner?: string;
  is_cross_repository?: boolean;
  is_draft?: boolean;
  maintainer_can_modify?: boolean;
  merge_commit?: string;
  merge_state_status?: string;
  mergeable?: string;
  merged?: boolean;
  merged_at?: Date;
  merged_by?: string;
  permalink?: string;
  potential_merge_commit?: string;
}
