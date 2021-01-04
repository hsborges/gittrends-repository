type TStatus = {
  created_at: Date;
  emoji?: string;
  expires_at?: Date;
  indicates_limited_availability?: boolean;
  message?: string;
  updated_at?: Date;
};
export interface IActor extends Record<string, unknown> {
  id: string;
  type: 'User' | 'Organization' | 'Mannequin' | 'Bot' | 'EnterpriseUserAccount';
  login: string;

  // Shared properties
  avatar_url?: string;
  created_at?: Date;
  database_id?: number;
  email?: string;
  location?: string;
  name?: string;
  repositories_count?: number;
  twitter_username?: string;
  updated_at?: Date;
  website_url?: string;

  // User
  bio?: string;
  company?: string;
  followers_count?: number;
  following_count?: number;
  gists_count?: number;
  is_bounty_hunter?: boolean;
  is_campus_expert?: boolean;
  is_developer_program_member?: boolean;
  is_employee?: boolean;
  is_hireable?: boolean;
  is_site_admin?: boolean;
  projects_count?: number;
  projects_url?: string;
  repositories_contributed_to_count?: number;
  starred_repositories_count?: string;
  status?: TStatus;
  watching_count?: number;

  // Organization
  description?: string;
  is_verified?: boolean;
  members_with_role_count?: number;
  teams_count?: number;

  // EnterpriseUserAccount
  enterprise?: string;
  user?: string;
}
