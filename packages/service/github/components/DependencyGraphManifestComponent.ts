/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';

type TOptions = { first?: number; after?: string };

export default class DependencyGraphManifestComponent extends Component {
  constructor(id: string, alias = 'manifest') {
    super(id, alias);
  }

  get fragments(): Fragment[] {
    return [];
  }

  includeDetails(include = true): this {
    this.includes.details = include && {
      textFragment: `
        ... on DependencyGraphManifest {
          dependenciesCount
          exceedsMaxSize
          filename
          id
          parseable
        }
      `
    };

    return this;
  }

  includeDependencies(include = true, { after, first = 100 }: TOptions): this {
    this.includes.dependencies = include && {
      textFragment: `
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
      `,
      first,
      after
    };

    return this;
  }

  toString(): string {
    return `
      ${this.alias}:node(id: "${this.id}") {
        type: __typename
        ${Object.values(this.includes)
          .filter((m) => m)
          .map((m) => m && m.textFragment)
          .join('\n')}
      }
    `;
  }
}
