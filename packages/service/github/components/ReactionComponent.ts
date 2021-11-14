/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from '../fragments/ActorFragment';

export default class ReactionComponent extends Component {
  constructor(id: string, alias = 'reactable') {
    super(id, alias);
  }

  get fragments(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  includeReactions(
    include = true,
    { first = 100, after }: { first: number; after?: string }
  ): this {
    const args = super.argsToString({ first, after });
    this.includes.reactions = include && {
      textFragment: `
        ... on Reactable {
          reactions(${args}, orderBy: { field: CREATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { content createdAt id user { ...${SimplifiedActorFragment.code} } }
          }
        }
      `,
      first,
      after
    };

    return this;
  }

  toString(): string {
    return this.includes.reactions
      ? `
          ${this.alias}:node(id: "${this.id}") {
            type:__typename
            ${this.includes.reactions.textFragment}
          }
        `
      : '';
  }
}
