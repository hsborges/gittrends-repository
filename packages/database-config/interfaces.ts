export interface IMetadata {
  id: string;
  resource: string;
  key: string;
  value: string;
}

export interface IActor {
  id: string;
  type: string;
  login: string;
  avatar_url: string;

  bio: string;
  company: string;
  followers_count: number;
  following_count: number;
  gists_count: number;
  is_bounty_hunter: boolean;
  is_campus_expert: boolean;
  is_developer_program_member: boolean;
  is_employee: boolean;
  is_hireable: boolean;
  is_site_admin: boolean;
  projects_count: number;
  projects_url: string;
  repositories_contributed_to_count: number;
  starred_repositories_count: string;
  status: string;
  watching_count: number;

  description: string;
  is_verified: boolean;
  members_with_role_count: number;
  teams_count: number;

  enterprise: string;
  user: string;

  created_at: Date;
  database_id: number;
  email: string;
  location: string;
  name: string;
  repositories_count: number;
  twitter_username: string;
  updated_at: Date;
  website_url: string;
}

export interface IRepository {
  id: string;
  assignable_users_count: number;
  code_of_conduct: string;
  contact_links: string;
  created_at: string;
  database_id: number;
  default_branch: string;
  delete_branch_on_merge: boolean;
  description: string;
  disk_usage: number;
  forks_count: number;
  funding_links: Array<{ platform: string; url: string }>;
  has_issues_enabled: boolean;
  has_projects_enabled: boolean;
  has_wiki_enabled: boolean;
  homepage_url: string;
  is_archived: boolean;
  is_blank_issues_enabled: boolean;
  is_disabled: boolean;
  is_empty: boolean;
  is_fork: boolean;
  is_in_organization: boolean;
  is_locked: boolean;
  is_mirror: boolean;
  is_private: boolean;
  is_security_policy_enabled: boolean;
  is_template: boolean;
  is_user_configuration_repository: boolean;
  issues_count: number;
  labels_count: number;
  languages: Array<{ language: string; size: number }>;
  license_info: string;
  lock_reason: string;
  mentionable_users_count: number;
  merge_commit_allowed: boolean;
  milestones_count: number;
  mirror_url: string;
  name: string;
  name_with_owner: string;
  open_graph_image_url: string;
  owner: string;
  parent: string;
  primary_language: string;
  pushed_at: Date;
  pull_requests_count: number;
  rebase_merge_allowed: boolean;
  releases_count: number;
  repository_topics: string[];
  squash_merge_allowed: boolean;
  stargazers_count: number;
  template_repository: string;
  updated_at: Date;
  url: string;
  uses_custom_open_graph_image: boolean;
  vulnerability_alerts_count: number;
  watchers_count: number;
}

export interface IStargazer {
  repository: string;
  user: string;
  starred_at: Date;
}