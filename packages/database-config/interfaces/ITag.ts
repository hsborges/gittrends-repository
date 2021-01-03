export interface ITag extends Record<string, unknown> {
  id: string;
  repository: string;
  name: string;
  oid?: string;
  message?: string;
  tagger?: {
    date: Date;
    email?: string;
    name: string;
    user?: string;
  };
  target?: string;
}
