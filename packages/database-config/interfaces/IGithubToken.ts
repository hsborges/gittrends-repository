export interface IGithubToken {
  token: string;
  type: string;
  scope: string;
  login?: string;
  email?: string;
  created_at: Date;
}
