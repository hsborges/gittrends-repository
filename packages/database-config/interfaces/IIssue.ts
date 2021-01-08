/* eslint-disable @typescript-eslint/ban-types */
export default interface IIssue extends Record<string, unknown> {
  id: string;
  repository: string;
  type: 'Issue' | 'PullRequest';
  active_lock_reason?: string;
  author?: string;
  author_association?: string;
  body?: string;
  closed?: boolean;
  closed_at?: Date;
  created_at?: Date;
  created_via_email?: boolean;
  database_id?: number;
  editor?: string;
  includes_created_edit?: boolean;
  last_edited_at?: Date;
  locked?: boolean;
  milestone?: string;
  number?: number;
  published_at?: Date;
  state?: string;
  title?: string;
  updated_at?: Date;
  assignees?: string[];
  labels?: string[];
  participants?: string[];
  reaction_groups?: string;
}
