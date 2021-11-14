/*
 *  Author: Hudson S. Borges
 */
import { get, omit } from 'lodash';

import {
  Issue,
  IssueRepository,
  PullRequest,
  PullRequestRepository,
  Reaction,
  ReactionRepository,
  RepositoryRepository,
  TimelineEvent,
  TimelineEventRepository
} from '@gittrends/database-config';

import Component from '../../github/Component';
import IssueComponent from '../../github/components/IssueComponent';
import PullRequestComponent from '../../github/components/PullRequestComponent';
import ReactionComponent from '../../github/components/ReactionComponent';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ForbiddenError, ResourceUpdateError, RetryableError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

type TComponent = IssueComponent | PullRequestComponent;
type TPaginable = { hasNextPage: boolean; endCursor?: string };

type TIssueMetadata = {
  data: Record<string, unknown>;
  component: TComponent;
  details: TPaginable;
  assignees: TPaginable;
  labels: TPaginable;
  participants: TPaginable;
  timeline: TPaginable;
  error?: Error;
};

type TReactableMetadata = {
  reactable: Record<string, unknown>;
  component: ReactionComponent;
  reactions: Record<string, unknown>[];
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
  private resourceAlias: string;
  private issues: { items: TIssueMetadata[]; hasNextPage: boolean; endCursor?: string };
  private reactions?: TReactableMetadata[];
  private currentStage?: Stages;
  private rBatchSize: number;
  private defaultRBatchSize: number;

  constructor(id: string, alias?: string, type: TResource = 'issues') {
    super(id, alias, type);
    this.resource = type;
    this.resourceAlias = `_${type}`;
    this.batchSize = this.defaultBatchSize = type === 'issues' ? 50 : 20;
    this.rBatchSize = this.defaultRBatchSize = 100;
    this.issues = { items: [], hasNextPage: true };
    this.debug('Issue handler built for %s (%s)', id, type);
  }

  async component(): Promise<RepositoryComponent | Component[]> {
    if (this.issues.hasNextPage && !this.pendingIssues.length && !this.pendingReactables.length) {
      this.debug('Updating component (stage: %s)', Stages[Stages.GET_ISSUES_LIST]);
      this.currentStage = Stages.GET_ISSUES_LIST;

      if (!this.issues.endCursor) {
        this.issues.endCursor = await RepositoryRepository.collection
          .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
          .then((result) => get(result, ['_metadata', this.meta.resource, 'endCursor']));
      }

      const method =
        this.resource === 'issues'
          ? this._component.includeIssues
          : this._component.includePullRequests;

      return method.bind(this._component)(true, {
        first: this.batchSize,
        after: this.issues.endCursor,
        alias: this.resourceAlias
      });
    }

    if (this.pendingIssues.length) {
      this.debug(
        'Updating component (stage: %s, items: %d)',
        Stages[Stages.GET_ISSUES_DETAILS],
        this.pendingIssues.length
      );
      this.currentStage = Stages.GET_ISSUES_DETAILS;

      return this.pendingIssues.map((issue) =>
        issue.component
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
          })
      );
    }

    if (this.pendingReactables.length) {
      this.debug('Updating component (stage: %s)', Stages[Stages.GET_REACTIONS]);
      this.currentStage = Stages.GET_REACTIONS;

      return this.pendingReactables.map((reactable) =>
        reactable.component.includeReactions(reactable.hasNextPage, {
          first: 100,
          after: reactable.endCursor
        })
      );
    }

    throw new ResourceUpdateError(new Error('Invalid condition reached!'));
  }

  async update(response: Record<string, unknown>): Promise<void> {
    this.debug('Processing %s information.', this.resource);
    return this._update(response).finally(() => {
      this.debug('Information updated. %o', {
        ...this.issues,
        items: this.issues.items.length
      });
      this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2);
      this.rBatchSize = Math.min(this.defaultRBatchSize, this.rBatchSize * 2);
    });
  }

  private async _update(response: Record<string, unknown>): Promise<void> {
    switch (this.currentStage) {
      case Stages.GET_ISSUES_LIST: {
        const data = super.parseResponse(response[super.alias as string]);
        const newIssues = get(data, `${this.resourceAlias}.nodes`, []);

        const newIssuesMetadata = await IssueRepository.collection
          .find(
            { _id: { $in: newIssues.map((ni: any) => ni.id) } },
            { projection: { _id: 1, _metadata: 1 } }
          )
          .toArray();

        this.issues.items = newIssues.map((issue: Record<string, unknown>) => ({
          data: { repository: this.id, ...issue },
          component: new (this.resource === 'issues' ? IssueComponent : PullRequestComponent)(
            issue.id as string,
            `issue_${issue.number}`
          ),
          details: { hasNextPage: true },
          assignees: { hasNextPage: true },
          labels: { hasNextPage: true },
          participants: { hasNextPage: true },
          timeline: {
            hasNextPage: true,
            endCursor: get(
              newIssuesMetadata.find((ni) => ni._id === issue.id),
              '_metadata.endCursor'
            )
          }
        }));

        const pageInfo = get(data, `${this.resourceAlias}.page_info`, {});
        this.issues.hasNextPage = pageInfo.has_next_page ?? false;
        this.issues.endCursor = pageInfo.end_cursor ?? this.issues.endCursor;

        if (this.pendingIssues.length) return;
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

        if (this.pendingIssues.length) return;

        const reactables: Record<string, unknown>[] = this.issues.items
          .filter((issue) => issue.data.reaction_groups)
          .map((issue) => ({ repository: this.id, issue: issue.data.id }));

        reactables.push(
          ...this.issues.items.reduce((eReactables: Record<string, unknown>[], issue) => {
            if (!issue.data.timeline) return eReactables;
            return eReactables.concat(
              (issue.data.timeline as [])
                .filter((event: Record<string, unknown>) => event.reaction_groups)
                .map((event: Record<string, unknown>) => ({
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

        if (this.pendingReactables.length) return;
        else break;
      }

      case Stages.GET_REACTIONS: {
        this.pendingReactables.forEach((meta) => {
          const data = super.parseResponse(response[meta.component.alias]);
          meta.reactions.push(...get(data, 'reactions.nodes', []));
          meta.hasNextPage = get(data, 'reactions.page_info.has_next_page', false);
          meta.endCursor = get(data, 'reactions.page_info.end_cursor', meta.endCursor);
        });

        if (this.pendingReactables.length) return;
        else break;
      }

      default:
        throw new ResourceUpdateError(new Error('Unknown condition reached!'));
    }

    const issues = this.issues.items.map((issue) => {
      if (issue.error) issue.data._metadata = { error: JSON.stringify(issue.error) };
      else issue.data._metadata = { updatedAt: new Date(), endCursor: issue.timeline.endCursor };
      return new (this.resource === 'issues' ? Issue : PullRequest)(omit(issue.data, 'timeline'));
    });

    const timeline = this.issues.items.reduce((acc: TimelineEvent[], issue) => {
      if (!issue.data.timeline) return acc;
      return acc.concat(
        (issue.data.timeline as Record<string, unknown>[]).map(
          (tl) => new TimelineEvent({ repository: this.id, issue: issue.data.id, ...tl })
        )
      );
    }, []);

    const reactions = (this.reactions || []).reduce(
      (reactions: Reaction[], meta) =>
        reactions.concat(
          meta.reactions.map((reaction) => new Reaction({ ...meta.reactable, ...reaction }))
        ),
      []
    );

    await Promise.all([
      super.saveReferences(),
      (this.resource === 'issues' ? IssueRepository : PullRequestRepository).upsert(issues),
      TimelineEventRepository.upsert(timeline),
      ReactionRepository.upsert(reactions)
    ]);

    await RepositoryRepository.collection.updateOne(
      { _id: this.meta.id },
      { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.issues.endCursor } }
    );

    this.issues.items = [];
    this.reactions = [];

    if (this.isDone()) {
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof RetryableError || err instanceof ForbiddenError) {
      switch (this.currentStage) {
        case Stages.GET_ISSUES_LIST:
        case Stages.GET_ISSUES_DETAILS:
          if (this.batchSize === 1) break;
          this.batchSize = 1;
          return;
        case Stages.GET_REACTIONS:
          if (this.rBatchSize === 1) break;
          this.rBatchSize = 1;
          return;
      }

      switch (this.currentStage) {
        case Stages.GET_ISSUES_LIST:
        case Stages.GET_ISSUES_DETAILS:
          const issue = this.pendingIssues[0];
          issue.details.hasNextPage =
            issue.assignees.hasNextPage =
            issue.labels.hasNextPage =
            issue.participants.hasNextPage =
            issue.timeline.hasNextPage =
              false;
          issue.error = err;
          return;
        case Stages.GET_REACTIONS:
          const reaction = this.pendingReactables[0];
          reaction.hasNextPage = false;
          reaction.error = err;
          return;
      }
    }

    throw err;
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
        .slice(0, this.rBatchSize) || []
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
