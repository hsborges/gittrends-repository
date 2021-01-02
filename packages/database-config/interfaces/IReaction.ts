export interface IReaction {
  id: string;
  repository: string;
  issue: string;
  event?: string;
  content: string;
  created_at: Date;
  user: string;
}
