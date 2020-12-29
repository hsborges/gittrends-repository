/*
 *  Author: Hudson S. Borges
 */
const ReactionComponent = require('../../github/graphql/components/ReactionComponent');
const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

const { get, snakeCase, lowerCase, omit } = require('lodash');
const { RetryableError, ForbiddenError } = require('../../helpers/errors');

const debug = require('debug')('updater:issues-handler');

module.exports = class RepositoryIssuesHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.batchSize = this.defaultBatchSize = 25;
    this.tlBatchSize = this.defaultTlBatchSize = 50;
    this.reactionsBatchSize = this.defaultReactionsBatchSize = 50;
    this.resource = snakeCase(lowerCase(this.constructor.type));
    this.meta = { id: this.component.id, resource: this.resource };
    this.issues = { hasNextPage: true, endCursor: null };
    this.details = [];
    this.reactions = [];
  }

  static get type() {
    return 'Issues';
  }

  static get IssueComponent() {
    return require('../../github/graphql/components/IssueComponent');
  }

  async updateComponent() {
    if (
      this.issues.hasNextPage &&
      !this.$hasNextPage(this.details) &&
      !this.$hasNextPage(this.reactions)
    ) {
      if (!this.issues.endCursor) {
        this.issues.endCursor = await this.dao.metadata
          .find({ ...this.meta, key: 'endCursor' })
          .select('value')
          .first()
          .then(({ value } = {}) => value);
      }

      this.component[`include${this.constructor.type}`](true, {
        first: this.batchSize,
        after: this.issues.endCursor || null,
        name: `_${this.resource}`
      });
    }

    if (this.$hasNextPage(this.details)) {
      const batch = this.details.filter((issue) => issue.hasNextPage).slice(0, this.batchSize);

      await Promise.each(batch, async (issue) => {
        if (issue.timeline.endCursor === null) {
          issue.timeline.endCursor = await this.dao.metadata
            .find({ id: issue.data.id, resource: this.resource.slice(0, -1), key: 'endCursor' })
            .select('value')
            .first()
            .then(({ value } = {}) => value);
        }

        issue.component
          .includeDetails(issue.details.hasNextPage)
          .includeAssignees(issue.assignees.hasNextPage, {
            after: issue.assignees.endCursor
          })
          .includeLabels(issue.labels.hasNextPage, {
            after: issue.labels.endCursor
          })
          .includeParticipants(issue.participants.hasNextPage, {
            after: issue.participants.endCursor
          })
          .includeTimeline(issue.timeline.hasNextPage, {
            first: this.tlBatchSize,
            after: issue.timeline.endCursor
          });
      });

      this.component.includeComponents(
        true,
        batch.map((issue) => issue.component)
      );
    }

    if (this.$hasNextPage(this.reactions)) {
      const batch = this.reactions.filter((meta) => meta.hasNextPage).slice(0, this.batchSize);

      batch.forEach((issue) => {
        issue.component.includeReactions(issue.hasNextPage, {
          first: this.reactionsBatchSize,
          after: issue.endCursor
        });
      });

      this.component.includeComponents(
        true,
        batch.map((issue) => issue.component)
      );
    }
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      if (!this.details.length) {
        const data = response[this.alias];

        this.details = get(data, `${this.resource}.nodes`, []).map((issue) => ({
          data: { repository: this.component.id, ...issue },
          component: new this.constructor.IssueComponent(issue.id, `${this.alias}_${issue.number}`),
          hasNextPage: true,
          details: { hasNextPage: true },
          assignees: { hasNextPage: true, endCursor: null },
          labels: { hasNextPage: true, endCursor: null },
          participants: { hasNextPage: true, endCursor: null },
          timeline: { hasNextPage: true, endCursor: null }
        }));

        const pageInfo = `${this.resource}.page_info`;
        this.issues.hasNextPage = get(data, `${pageInfo}.has_next_page`);
        this.issues.endCursor = get(data, `${pageInfo}.end_cursor`, this.issues.endCursor);

        debug(`${this.details.length} ${this.resource} obtained from ${this.component.id} ...`);

        if (this.details.length) return;
      }

      if (this.$hasNextPage(this.details)) {
        this.details
          .filter((issue) => issue.hasNextPage)
          .slice(0, this.batchSize)
          .forEach((issue) => {
            const data = response[issue.component.alias];
            const omitFields = ['assignees', 'labels', 'participants', 'timeline'];

            if (issue.details.hasNextPage) {
              issue.details.hasNextPage = false;
              issue.data = { ...issue.data, ...omit(data, omitFields) };
              issue.data.assignees = [];
              issue.data.labels = [];
              issue.data.participants = [];
              issue.data.timeline = [];
            }

            issue.data.assignees.push(...get(data, 'assignees.nodes', []));
            issue.assignees.hasNextPage = get(data, 'assignees.page_info.has_next_page');
            issue.assignees.endCursor = get(data, 'assignees.page_info.end_cursor');

            issue.data.labels.push(...get(data, 'labels.nodes', []));
            issue.labels.hasNextPage = get(data, 'labels.page_info.has_next_page');
            issue.labels.endCursor = get(data, 'labels.page_info.end_cursor');

            issue.data.participants.push(...get(data, 'participants.nodes', []));
            issue.participants.hasNextPage = get(data, 'participants.page_info.has_next_page');
            issue.participants.endCursor = get(data, 'participants.page_info.end_cursor');

            issue.data.timeline.push(...get(data, 'timeline.nodes', []));
            issue.timeline.hasNextPage = get(data, 'timeline.page_info.has_next_page');
            issue.timeline.endCursor = get(
              data,
              'timeline.page_info.end_cursor',
              issue.timeline.endCursor
            );

            issue.hasNextPage =
              issue.assignees.hasNextPage ||
              issue.labels.hasNextPage ||
              issue.participants.hasNextPage ||
              issue.timeline.hasNextPage;
          });

        if (!this.$hasNextPage(this.details)) {
          this.reactions = this.details
            .filter((issue) => issue.data.reaction_groups)
            .map((meta) => ({ repository: this.repositoryId, issue: meta.data.id }))
            .concat(
              this.details.reduce((timeseries, issue) => {
                if (!issue.data.timeline) return timeseries;
                return timeseries.concat(
                  issue.data.timeline
                    .filter((event) => event.reaction_groups)
                    .map((event) => ({
                      repository: this.repositoryId,
                      issue: issue.data.id,
                      event: event.id
                    }))
                );
              }, [])
            )
            .map((reactable, index) => ({
              reactable,
              component: ReactionComponent.create({
                id: reactable.event || reactable.issue,
                alias: `${this.alias}_reactable_${index}`
              }),
              reactions: [],
              hasNextPage: true,
              endCursor: null
            }));
        }
      }

      if (this.$hasNextPage(this.reactions)) {
        this.reactions
          .filter((meta) => meta.hasNextPage)
          .slice(0, this.batchSize)
          .forEach((meta) => {
            const data = response[meta.component.alias];
            meta.reactions.push(...get(data, 'reactions.nodes', []));
            meta.hasNextPage = get(data, 'reactions.page_info.has_next_page');
            meta.endCursor = get(data, 'reactions.page_info.end_cursor');
          });

        if (this.$hasNextPage(this.reactions)) return;
      }

      if (!this.$hasNextPage(this.details) && !this.$hasNextPage(this.reactions)) {
        const issues = this.details.map((meta) => this.compact(omit(meta.data, 'timeline')));

        const issuesMetadata = this.details.reduce((acc, issue) => {
          const path = { id: issue.data.id, resource: this.resource.slice(0, -1) };
          return acc.concat(
            issue.error
              ? [{ ...path, key: 'error', value: JSON.stringify(issue.error) }]
              : [
                  { ...path, key: 'updatedAt', value: new Date().toISOString() },
                  { ...path, key: 'endCursor', value: issue.timeline.endCursor }
                ]
          );
        }, []);

        const timeline = this.details.reduce((acc, issue) => {
          if (!issue.data.timeline) return acc;
          return acc.concat(
            issue.data.timeline.map((tl) =>
              this.compact({
                id: tl.id,
                repository: this.component.id,
                issue: issue.data.id,
                type: tl.type,
                payload: omit(tl, ['id', 'type'])
              })
            )
          );
        }, []);

        const reactions = this.reactions.reduce(
          (reactions, meta) =>
            reactions.concat(
              meta.reactions.map((reaction) => ({ ...meta.reactable, ...reaction }))
            ),
          []
        );

        debug(
          `Persisting ${this.resource}=${issues.length}, timeline=${timeline.length}, and reactions=${reactions.length} ...`
        );

        await Promise.all([
          this.dao[this.resource].insert(issues, trx),
          this.dao.timeline.insert(timeline, trx),
          this.dao.reactions.insert(reactions, trx),
          this.dao.metadata.upsert(
            [{ ...this.meta, key: 'endCursor', value: this.issues.endCursor }, ...issuesMetadata],
            trx
          )
        ]);

        this.details = [];
        this.reactions = [];
        this.batchSize = this.defaultBatchSize;
      }
    }

    if (this.done) {
      return this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
    }
  }

  async error(err) {
    if (err instanceof RetryableError || err instanceof ForbiddenError) {
      const errorName = err.name || err.constructor.name;
      const currentValues = [this.batchSize, this.tlBatchSize, this.reactionsBatchSize].join(', ');
      debug(`(${errorName}) reducing batch size (current: ${currentValues}) ...`);

      const hasNextDetails = this.$hasNextPage(this.details);
      const hasNextReactions = this.$hasNextPage(this.reactions);

      if (this.batchSize > 1)
        if (this.batchSize > 1) return (this.batchSize = Math.floor(this.batchSize / 2));

      if (hasNextDetails) {
        const issue = this.details.filter((meta) => meta.hasNextPage)[0];
        debug(`Disabling issue metadata updater for id=${issue.data.id}`);
        issue.hasNextPage = false;
        issue.error = err;
      } else if (hasNextReactions) {
        debug(`Disabling reactions metadata updater`);
        // TODO -- handle single reactables problems
        const reaction = this.reactions.filter((meta) => meta.hasNextPage)[0];
        reaction.hasNextPage = false;
        reaction.error = err;
      }

      this.batchSize = this.defaultBatchSize;
      this.tlBatchSize = this.defaultTlBatchSize;
      this.reactionsBatchSize = this.defaultReactionsBatchSize;

      return;
    }

    throw err;
  }

  $hasNextPage(array) {
    return (array || []).reduce((acc, value) => acc || value.hasNextPage, false);
  }

  get alias() {
    const alias = this.details
      .filter((meta) => meta.hasNextPage)
      .map((meta) => meta.component.alias);
    alias.push(super.alias);
    alias.push(
      ...(this.reactions || [])
        .filter((meta) => meta.hasNextPage)
        .map((meta) => meta.component.alias)
    );
    return alias;
  }

  get hasNextPage() {
    return (
      this.issues.hasNextPage ||
      this.$hasNextPage(this.details) ||
      this.$hasNextPage(this.reactions)
    );
  }
};
