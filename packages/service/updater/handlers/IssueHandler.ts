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

export default class RepositoryIssuesHander extends AbstractRepositoryHandler {
  private resource: TResource;
  private issues: { items: TIssueMetadata[]; hasNextPage: boolean; endCursor?: string };
  private reactions?: TReactableMetadata[];

  constructor(id: string, alias?: string, type: TResource = 'issues') {
    super(id, alias, type);
    this.resource = type;
    this.batchSize = this.defaultBatchSize = type === 'issues' ? 25 : 15;
    this.issues = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent | Component[]> {
    if (
      this.issues.hasNextPage &&
      this.getPendingIssues().length === 0 &&
      this.getPendingReactables().length === 0
    ) {
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

    const pendingIssues = this.getPendingIssues();
    if (pendingIssues.length > 0) {
      return Promise.all(
        pendingIssues.map(async (issue) => {
          if (!issue.timeline.endCursor) {
            issue.timeline.endCursor = await Issue.collection
              .findOne({ _id: issue.data.id }, { projection: { _metadata: 1 } })
              .then((result) => result && get(result, '_metadata.endCursor'));
          }

          return issue.component
            .includeDetails(issue.details.hasNextPage)
            .includeAssignees(issue.assignees.hasNextPage, {
              first: 50,
              after: issue.assignees.endCursor
            })
            .includeLabels(issue.labels.hasNextPage, {
              first: 50,
              after: issue.labels.endCursor
            })
            .includeParticipants(issue.participants.hasNextPage, {
              first: 50,
              after: issue.participants.endCursor
            })
            .includeTimeline(issue.timeline.hasNextPage, {
              first: 50,
              after: issue.timeline.endCursor
            });
        })
      );
    }

    const pendingReactables = this.getPendingReactables();
    if (pendingReactables.length > 0) {
      return pendingReactables.map((reactable) =>
        reactable.component.includeReactions(reactable.hasNextPage, {
          first: 50,
          after: reactable.endCursor
        })
      );
    }

    return [];
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    if (this.isDone()) return;

    if (this.issues.items.length === 0) {
      const data = response[super.alias as string];

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

      if (this.issues.items.length) return;
    }

    const pendingIssues = this.getPendingIssues();
    if (pendingIssues.length > 0) {
      pendingIssues.forEach((item) => {
        const data = response[item.component.alias];
        const omitFields = ['assignees', 'labels', 'participants', 'timeline'];

        if (item.details.hasNextPage) {
          item.details.hasNextPage = false;
          item.data = { ...item.data, ...omit(data as TObject, omitFields) };
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

      if (this.getPendingIssues().length > 0) return;
    }

    if (this.getPendingIssues().length === 0 && !this.reactions) {
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

      return;
    }

    const pendindReactables = this.getPendingReactables();
    if (pendindReactables.length > 0) {
      pendindReactables.forEach((meta) => {
        const data = response[meta.component.alias];
        meta.reactions.push(...get(data, 'reactions.nodes', []));
        meta.hasNextPage = get(data, 'reactions.page_info.has_next_page', false);
        meta.endCursor = get(data, 'reactions.page_info.end_cursor', meta.endCursor);
      });

      if (this.getPendingReactables().length > 0) return;
    }

    if (this.getPendingIssues().length === 0 && this.getPendingReactables().length === 0) {
      const issues = this.issues.items.map(
        (meta) => compact(omit(meta.data, 'timeline')) as TObject
      );

      this.issues.items.forEach((issue) => {
        if (issue.error) issue.data._metadata = { error: JSON.stringify(issue.error) };
        else issue.data._metadata = { updatedAt: new Date(), endCursor: issue.timeline.endCursor };
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

      await Promise.all([
        (this.resource === 'issues' ? Issue : PullRequest).upsert(issues, session),
        TimelineEvent.upsert(timeline, session),
        Reaction.upsert(reactions, session)
      ]);

      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.issues.endCursor } },
        { session }
      );

      this.issues.items = [];
      this.reactions = undefined;
      this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2);
    }

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
      const hasNextDetails = this.getPendingIssues().length > 0;
      const hasNextReactions = this.getPendingReactables().length > 0;

      if (this.batchSize > 1)
        if (this.batchSize > 1) {
          this.batchSize = Math.floor(this.batchSize / 2);
          return;
        }

      if (hasNextDetails) {
        const issue = this.getPendingIssues()[0];
        issue.details.hasNextPage = issue.assignees.hasNextPage = issue.labels.hasNextPage = issue.participants.hasNextPage = issue.timeline.hasNextPage = false;
        issue.error = err;
      } else if (hasNextReactions) {
        // TODO -- handle single reactables problems
        const reaction = this.getPendingReactables()[0];
        reaction.hasNextPage = false;
        reaction.error = err;
      }

      this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2);

      return;
    }

    throw new ResourceUpdateError(err.message, err);
  }

  getPendingIssues(): TIssueMetadata[] {
    return this.issues.items
      .filter(
        (i) =>
          i.details.hasNextPage ||
          i.labels.hasNextPage ||
          i.participants.hasNextPage ||
          i.timeline.hasNextPage
      )
      .slice(0, this.batchSize);
  }

  getPendingReactables(): TReactableMetadata[] {
    return this.reactions?.filter((rm) => rm.hasNextPage).slice(0, this.batchSize) || [];
  }

  get alias(): string[] {
    const alias = this.getPendingIssues().map((meta) => meta.component.alias);
    alias.push(...(super.alias === 'string' ? [super.alias] : super.alias));
    alias.push(...this.getPendingReactables().map((meta) => meta.component.alias));
    return alias;
  }

  hasNextPage(): boolean {
    return (
      this.issues.hasNextPage ||
      this.getPendingIssues().length > 0 ||
      this.getPendingReactables().length > 0
    );
  }
}
