export interface IDependency {
  repository: string;
  manifest: string;
  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  package_name: string;
  target_repository?: Record<string, unknown>;
  requirements?: string;
}
