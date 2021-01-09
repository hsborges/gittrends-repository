/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from '../fragments/ActorFragment';

export default class ReactionComponent extends Component {
  readonly id: string;
  readonly include: { include: boolean; textFragment: string };

  constructor(id: string, alias = 'reactable') {
    super(alias);
    this.id = id;
    this.include = { include: false, textFragment: '' };
  }

  get fragments(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  includeReactions(
    include = true,
    { first = 100, after }: { first: number; after?: string }
  ): this {
    const args = super.argsToString({ first, after });
    this.include.include = include;
    this.include.textFragment = include
      ? `
      ... on Reactable {
        reactions(${args}, orderBy: { field: CREATED_AT, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes { content createdAt id user { ...${SimplifiedActorFragment.code} } }
        }
      }
    `
      : '';

    return this;
  }

  toString(): string {
    return `
      ${this.alias}:node(id: "${this.id}") {
        type:__typename
        ${this.include.textFragment}
      }
    `;
  }
}
