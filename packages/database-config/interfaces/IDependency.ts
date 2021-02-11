/** @additionalProperties false */
export default interface IDependency extends Record<string, unknown> {
  repository: string;
  manifest: string;
  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  package_name: string;
  target_repository?: {
    id: string;
    database_id: number;
    name_with_owner: string;
  };
  requirements?: string;
}
