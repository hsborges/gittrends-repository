/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IRepository extends Record<string, unknown> {
  id: string;
  assignable_users_count?: number;
  code_of_conduct?: string;
  contact_links?: string;
  created_at?: string;
  database_id?: number;
  default_branch?: string;
  delete_branch_on_merge?: boolean;
  description?: string;
  disk_usage?: number;
  forks_count?: number;
  funding_links?: { platform?: string; url: string }[];
  has_issues_enabled?: boolean;
  has_projects_enabled?: boolean;
  has_wiki_enabled?: boolean;
  homepage_url?: string;
  is_archived?: boolean;
  is_blank_issues_enabled?: boolean;
  is_disabled?: boolean;
  is_empty?: boolean;
  is_fork?: boolean;
  is_in_organization?: boolean;
  is_locked?: boolean;
  is_mirror?: boolean;
  is_private?: boolean;
  is_security_policy_enabled?: boolean;
  is_template?: boolean;
  is_user_configuration_repository?: boolean;
  issues_count?: number;
  labels_count?: number;
  languages?: { language: string; size: number }[];
  license_info?: string;
  lock_reason?: string;
  mentionable_users_count?: number;
  merge_commit_allowed?: boolean;
  milestones_count?: number;
  mirror_url?: string;
  name?: string;
  name_with_owner: string;
  open_graph_image_url?: string;
  owner: string;
  parent?: string;
  primary_language?: string;
  pushed_at?: Date;
  pull_requests_count?: number;
  rebase_merge_allowed?: boolean;
  releases_count?: number;
  repository_topics?: string[];
  squash_merge_allowed?: boolean;
  stargazers_count?: number;
  template_repository?: string;
  updated_at?: Date;
  url?: string;
  uses_custom_open_graph_image?: boolean;
  vulnerability_alerts_count?: number;
  watchers_count?: number;

  // entity metadata
  // eslint-disable-next-line @typescript-eslint/ban-types
  _metadata?: object;
}
