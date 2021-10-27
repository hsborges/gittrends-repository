export type Actor = {
  id: string;
  type: string;
  login: string;
  name: string;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
};

export type RepositoryMetadata = {
  resource: string;
  updated_at?: Date;
  end_cursor?: string;
};

export type BaseRepository = {
  id: string;
  name: string;
  owner?: Actor;
  name_with_owner: string;
  stargazers_count?: number;
  watchers_count?: number;
  forks_count?: number;
  primary_language?: string;
  open_graph_image_url?: string;
  description?: string;
};

export type Repository = BaseRepository & {
  homepage_url?: string;
  default_branch?: string;
  code_of_conduct?: string;
  license_info?: string;
  issues_count?: number;
  pull_requests_count_count?: number;
  releases_count?: number;
  repository_topics?: string[];
  vulnerability_alerts_count?: number;
  created_at?: Date;
  updated_at?: Date;
  disk_usage?: number;
  metadata: RepositoryMetadata[];
};

export type StargazerTimeseries = {
  date: Date;
  stargazers_count: number;
};

export type Stargazer = {
  user: Actor;
  starred_at: Date;
  type: string;
};

export type Tag = {
  id: string;
  name: string;
  committed_date: Date;
  additions: number;
  deletions: number;
  changed_files: number;
};

export type ResourceStat = {
  resource: string;
  count: number;
};
