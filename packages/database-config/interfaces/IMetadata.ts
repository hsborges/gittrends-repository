export interface IMetadata extends Record<string, unknown> {
  id: string;
  resource: string;
  key: string;
  value?: string;
}
