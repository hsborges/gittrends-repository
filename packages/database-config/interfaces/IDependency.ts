/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IDependency extends Record<string, unknown> {
  _id: {
    repository: string;
    manifest: string;
    package_name: string;
  };
  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  target_repository?: {
    id: string;
    database_id: number;
    name_with_owner: string;
  };
  requirements?: string;
}
