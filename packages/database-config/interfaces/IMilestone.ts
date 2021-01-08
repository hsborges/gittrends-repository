export default interface IMilestone extends Record<string, unknown> {
  id: string;
  repository: string;
  creator: string;
  description?: string;
  dueOn?: Date;
  number?: number;
  state?: string;
  title?: string;
}
