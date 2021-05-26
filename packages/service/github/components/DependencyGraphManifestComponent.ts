/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';

type TIncludes = 'details' | 'dependencies';
type TOptions = { first?: number; after?: string };

export default class DependencyGraphManifestComponent extends Component {
  readonly id: string;
  readonly includes: Record<TIncludes, { include: boolean; textFragment: string }>;

  constructor(id: string, alias = 'manifest') {
    super(alias);
    this.id = id;
    this.includes = {
      details: { include: false, textFragment: '' },
      dependencies: { include: false, textFragment: '' }
    };
  }

  get fragments(): Fragment[] {
    return [];
  }

  includeDetails(include = true): this {
    this.includes.details.include = include;
    this.includes.details.textFragment = include
      ? `
      ... on DependencyGraphManifest {
        dependenciesCount
        exceedsMaxSize
        filename
        id
        parseable
      }
    `
      : '';

    return this;
  }

  includeDependencies(include = true, { after, first = 100 }: TOptions): this {
    this.includes.dependencies.include = include;
    this.includes.dependencies.textFragment = include
      ? `
      ... on DependencyGraphManifest {
        dependencies (${super.argsToString({ after, first })}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            hasDependencies
            packageManager
            packageName
            targetRepository:repository { id databaseId nameWithOwner }
            requirements
          }
        }
      }
    `
      : '';

    return this;
  }

  toString(): string {
    return `
      ${this.alias}:node(id: "${this.id}") {
        type: __typename
        ${Object.values(this.includes)
          .filter((m) => m.include)
          .map((m) => m.textFragment)
          .join('\n')}
      }
    `;
  }
}
