/*
 *  Author: Hudson S. Borges
 */
import { get, omit } from 'lodash';
import { ClientSession } from 'mongodb';
import {
  Issue,
  PullRequest,
  Reaction,
  Repository,
  TimelineEvent
} from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import Component from '../../github/Component';
import IssueComponent from '../../github/components/IssueComponent';
import PullRequestComponent from '../../github/components/PullRequestComponent';
import ReactionComponent from '../../github/components/ReactionComponent';
import RepositoryComponent from '../../github/components/RepositoryComponent';

import compact from '../../helpers/compact';
import { RetryableError, ForbiddenError, ResourceUpdateError } from '../../helpers/errors';

type TComponent = IssueComponent | PullRequestComponent;
type TPaginable = { hasNextPage: boolean; endCursor?: string };

type TIssueMetadata = {
  data: TObject;
  component: TComponent;
  details: TPaginable;
  assignees: TPaginable;
  labels: TPaginable;
  participants: TPaginable;
  timeline: TPaginable;
  error?: Error;
};

type TReactableMetadata = {
  reactable: TObject;
  component: ReactionComponent;
  reactions: TObject[];
  hasNextPage: boolean;
  endCursor?: string;
  error?: Error;
};

type TResource = 'issues' | 'pull_requests';

enum Stages {
  GET_ISSUES_LIST,
  GET_ISSUES_DETAILS,
  GET_REACTIONS
}

export default class RepositoryIssuesHander extends AbstractRepositoryHandler {
  private resource: TResource;
  private issues: { items: TIssueMetadata[]; hasNextPage: boolean; endCursor?: string };
  private reactions?: TReactableMetadata[];
  private currentStage?: Stages;

  constructor(id: string, alias?: string, type: TResource = 'issues') {
    super(id, alias, type);
    this.resource = type;
    this.batchSize = this.defaultBatchSize = type === 'issues' ? 15 : 10;
    this.issues = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent | Component[]> {
    if (
      this.issues.hasNextPage &&
      this.pendingIssues.length === 0 &&
      this.pendingReactables.length === 0
    ) {
      this.currentStage = Stages.GET_ISSUES_LIST;

      if (!this.issues.endCursor) {
        this.issues.endCursor = await Repository.collection
          .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
          .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
      }

      const method =
        this.resource === 'issues'
          ? this._component.includeIssues
          : this._component.includePullRequests;

      return method.bind(this._component)(true, {
        first: this.batchSize,
        after: this.issues.endCursor,
        alias: `_${this.resource}`
      });
    }

    if (this.pendingIssues.length > 0) {
      this.currentStage = Stages.GET_ISSUES_DETAILS;

      return Promise.all(
        this.pendingIssues.map(async (issue) => {
          if (!issue.timeline.endCursor) {
            issue.timeline.endCursor = await Issue.collection
              .findOne({ _id: issue.data.id }, { projection: { _metadata: 1 } })
              .then((result) => result && get(result, '_metadata.endCursor'));
          }

          return issue.component
            .includeDetails(issue.details.hasNextPage)
            .includeAssignees(issue.assignees.hasNextPage, {
              first: 100,
              after: issue.assignees.endCursor
            })
            .includeLabels(issue.labels.hasNextPage, {
              first: 100,
              after: issue.labels.endCursor
            })
            .includeParticipants(issue.participants.hasNextPage, {
              first: 100,
              after: issue.participants.endCursor
            })
            .includeTimeline(issue.timeline.hasNextPage, {
              first: 100,
              after: issue.timeline.endCursor
            });
        })
      );
    }

    if (this.pendingReactables.length > 0) {
      this.currentStage = Stages.GET_REACTIONS;

      return this.pendingReactables.map((reactable) =>
        reactable.component.includeReactions(reactable.hasNextPage, {
          first: 100,
          after: reactable.endCursor
        })
      );
    }

    throw new ResourceUpdateError('Invalid condition reached!');
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    return this._update(response, session).finally(
      () => (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2))
    );
  }

  private async _update(response: TObject, session?: ClientSession): Promise<void> {
    switch (this.currentStage) {
      case Stages.GET_ISSUES_LIST: {
        const data = super.parseResponse(response[super.alias as string]);

        this.issues.items = get(data, `${this.resource}.nodes`, []).map((issue: TObject) => ({
          data: { repository: this.id, ...issue },
          component: new (this.resource === 'issues' ? IssueComponent : PullRequestComponent)(
            issue.id as string,
            `issue_${issue.number}`
          ),
          details: { hasNextPage: true },
          assignees: { hasNextPage: true },
          labels: { hasNextPage: true },
          participants: { hasNextPage: true },
          timeline: { hasNextPage: true }
        }));

        const pageInfo = get(data, `${this.resource}.page_info`, {});
        this.issues.hasNextPage = pageInfo.has_next_page ?? false;
        this.issues.endCursor = pageInfo.end_cursor ?? this.issues.endCursor;

        if (this.issues.items.length > 0) return;
        else break;
      }

      case Stages.GET_ISSUES_DETAILS: {
        this.pendingIssues.forEach((item) => {
          const data = super.parseResponse(response[item.component.alias]);
          const omitFields = ['assignees', 'labels', 'participants', 'timeline'];

          if (item.details.hasNextPage) {
            item.details.hasNextPage = false;
            item.data = { ...item.data, ...omit(data, omitFields) };
            item.data.assignees = [];
            item.data.labels = [];
            item.data.participants = [];
            item.data.timeline = [];
          }

          const aPageInfo = get(data, 'assignees.page_info', {});
          (item.data.assignees as []).push(...(get(data, 'assignees.nodes', []) as []));
          item.assignees.hasNextPage = aPageInfo.has_next_page ?? false;
          item.assignees.endCursor = aPageInfo.end_cursor ?? item.assignees.endCursor;

          const lPageInfo = get(data, 'labels.page_info', {});
          (item.data.labels as []).push(...(get(data, 'labels.nodes', []) as []));
          item.labels.hasNextPage = lPageInfo.has_next_page ?? false;
          item.labels.endCursor = lPageInfo.end_cursor ?? item.labels.endCursor;

          const pPageInfo = get(data, 'participants.page_info', {});
          (item.data.participants as []).push(...(get(data, 'participants.nodes', []) as []));
          item.participants.hasNextPage = pPageInfo.has_next_page ?? false;
          item.participants.endCursor = pPageInfo.end_cursor ?? item.participants.endCursor;

          const tPageInfo = get(data, 'timeline.page_info', {});
          (item.data.timeline as []).push(...(get(data, 'timeline.nodes', []) as []));
          item.timeline.hasNextPage = tPageInfo.has_next_page ?? false;
          item.timeline.endCursor = tPageInfo.end_cursor ?? item.timeline.endCursor;
        });

        if (this.pendingIssues.length > 0) return;

        const reactables: TObject[] = this.issues.items
          .filter((issue) => issue.data.reaction_groups)
          .map((issue) => ({ repository: this.id, issue: issue.data.id }));

        reactables.push(
          ...this.issues.items.reduce((eReactables: TObject[], issue) => {
            if (!issue.data.timeline) return eReactables;
            return eReactables.concat(
              (issue.data.timeline as [])
                .filter((event: TObject) => event.reaction_groups)
                .map((event: TObject) => ({
                  repository: this.id,
                  issue: issue.data.id,
                  event: event.id
                }))
            );
          }, [])
        );

        this.reactions = reactables.map((reactable, index) => ({
          reactable,
          component: new ReactionComponent(
            (reactable.event || reactable.issue) as string,
            `issue_reactable_${index}`
          ),
          reactions: [],
          hasNextPage: true
        }));

        if (this.reactions.length > 0) return;
        else break;
      }

      case Stages.GET_REACTIONS: {
        this.pendingReactables.forEach((meta) => {
          const data = super.parseResponse(response[meta.component.alias]);
          meta.reactions.push(...get(data, 'reactions.nodes', []));
          meta.hasNextPage = get(data, 'reactions.page_info.has_next_page', false);
          meta.endCursor = get(data, 'reactions.page_info.end_cursor', meta.endCursor);
        });

        if (this.pendingReactables.length > 0) return;
        else break;
      }

      default:
        throw new ResourceUpdateError('Unknown condition reached!');
    }

    const issues = this.issues.items.map((issue) => {
      if (issue.error) issue.data._metadata = { error: JSON.stringify(issue.error) };
      else issue.data._metadata = { updatedAt: new Date(), endCursor: issue.timeline.endCursor };

      return compact(omit(issue.data, 'timeline')) as TObject;
    });

    const timeline = this.issues.items.reduce((acc: TObject[], issue) => {
      if (!issue.data.timeline) return acc;
      return acc.concat(
        (issue.data.timeline as TObject[]).map(
          (tl) =>
            compact({
              repository: this.id,
              issue: issue.data.id,
              ...tl
            }) as TObject
        )
      );
    }, []);

    const reactions = (this.reactions || []).reduce(
      (reactions: TObject[], meta) =>
        reactions.concat(meta.reactions.map((reaction) => ({ ...meta.reactable, ...reaction }))),
      []
    );

    await super
      .saveReferences(session)
      .then(() =>
        Promise.all([
          (this.resource === 'issues' ? Issue : PullRequest).upsert(issues, session),
          TimelineEvent.upsert(timeline, session),
          Reaction.upsert(reactions, session)
        ])
      );

    await Repository.collection.updateOne(
      { _id: this.meta.id },
      { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.issues.endCursor } },
      { session }
    );

    this.issues.items = [];
    this.reactions = [];

    if (this.isDone()) {
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } },
        { session }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof RetryableError || err instanceof ForbiddenError) {
      if (this.batchSize > 1) {
        this.batchSize = 1;
        return;
      }

      if (this.pendingIssues.length > 0) {
        const issue = this.pendingIssues[0];
        issue.details.hasNextPage = issue.assignees.hasNextPage = issue.labels.hasNextPage = issue.participants.hasNextPage = issue.timeline.hasNextPage = false;
        issue.error = err;
      } else if (this.pendingReactables.length > 0) {
        const reaction = this.pendingReactables[0];
        reaction.hasNextPage = false;
        reaction.error = err;
      }

      return;
    }

    throw new ResourceUpdateError(err.message, err);
  }

  get pendingIssues(): TIssueMetadata[] {
    return this.issues.items
      .filter(
        (issue) =>
          (issue.details.hasNextPage ||
            issue.assignees.hasNextPage ||
            issue.labels.hasNextPage ||
            issue.participants.hasNextPage ||
            issue.timeline.hasNextPage) &&
          !issue.error
      )
      .slice(0, this.batchSize);
  }

  get pendingReactables(): TReactableMetadata[] {
    return (
      this.reactions
        ?.filter((reactable) => reactable.hasNextPage && !reactable.error)
        .slice(0, this.batchSize) || []
    );
  }

  get alias(): string[] {
    const alias = this.pendingIssues.map((meta) => meta.component.alias);
    alias.push(...(super.alias === 'string' ? [super.alias] : super.alias));
    alias.push(...this.pendingReactables.map((meta) => meta.component.alias));
    return alias;
  }

  hasNextPage(): boolean {
    return (
      this.issues.hasNextPage || this.pendingIssues.length > 0 || this.pendingReactables.length > 0
    );
  }
}
