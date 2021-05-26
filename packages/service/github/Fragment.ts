/*
 *  Author: Hudson S. Borges
 */
export default abstract class Fragment {
  protected static include(full: boolean, field: string): string {
    return full ? field : '';
  }

  get dependencies(): Fragment[] {
    return [];
  }

  abstract get code(): string;
  abstract toString(): string;
}
