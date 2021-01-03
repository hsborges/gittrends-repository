export interface IStargazer extends Record<string, unknown> {
  repository: string;
  user: string;
  starred_at: Date;
}
