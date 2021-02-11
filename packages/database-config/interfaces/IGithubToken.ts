/** @additionalProperties false */
export default interface IGithubToken extends Record<string, unknown> {
  token: string;
  type: string;
  scope: string;
  login?: string;
  email?: string;
  created_at: Date;
}
