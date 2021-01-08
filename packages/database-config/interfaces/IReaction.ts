export default interface IReaction extends Record<string, unknown> {
  id: string;
  repository: string;
  issue: string;
  event?: string;
  content: string;
  created_at: Date;
  user: string;
}
