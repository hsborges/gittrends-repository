const { get, snakeCase, lowerCase, omit } = require('lodash');
const compact = require('../../helpers/compact');

const IssueComponent = require('../../github/graphql/components/IssueComponent');
const ReactionComponent = require('../../github/graphql/components/ReactionComponent');
const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

module.exports = class RepositoryIssuesHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.issues = { hasNextPage: true, endCursor: null };
    this.resource = snakeCase(lowerCase(this.constructor.type));
    this.meta = { id: this.component.id, resource: this.resource };
    this.issuesMetadata = null;
    this.reactionsMetadata = null;
  }

  static get type() {
    return 'Issues';
  }

  async updateComponent() {
    if (!this.issues.endCursor) {
      this.issues.endCursor = await this.dao.metadata
        .find({ ...this.meta, key: 'endCursor' })
        .select('value')
        .first()
        .then(({ value } = {}) => value);
    }

    this.component[`include${this.constructor.type}`](
      this.issues.hasNextPage && !this.issuesMetadata && !this.reactionsMetadata,
      {
        first: 50,
        after: this.issues.endCursor || null,
        name: `_${this.resource}`
      }
    );

    if (this.issuesMetadata && this.pendingIssuesMetadata.length) {
      this.pendingIssuesMetadata.forEach((metadata) => {
        metadata.component
          .includeDetails(metadata.details.hasNextPage)
          .includeAssignees(metadata.assignees.hasNextPage, {
            after: metadata.assignees.endCursor
          })
          .includeLabels(metadata.labels.hasNextPage, {
            after: metadata.labels.endCursor
          })
          .includeParticipants(metadata.participants.hasNextPage, {
            after: metadata.participants.endCursor
          })
          .includeTimeline(metadata.timeline.hasNextPage, {
            after: metadata.timeline.endCursor
          });
      });

      this.component.includeComponents(
        true,
        this.pendingIssuesMetadata.map((metadata) => metadata.component)
      );
    }

    if (this.reactionsMetadata && this.pendingReactionsMetadata.length) {
      this.pendingReactionsMetadata.forEach((metadata) => {
        metadata.component.includeReactions(metadata.hasNextPage, { after: metadata.endCursor });
      });

      this.component.includeComponents(
        true,
        this.pendingReactionsMetadata.map((metadata) => metadata.component)
      );
    }
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      if (!this.issuesMetadata && !this.reactionsMetadata) {
        const data = response[this.alias];

        this.issuesMetadata = get(data, `${this.resource}.nodes`, [])
          .map((issue) => ({ repository: this.component.id, ...issue }))
          .map((issue) => ({
            issue,
            component: new IssueComponent(issue.id, `${this.alias}_${issue.number}`),
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
      } else {
        this.pendingIssuesMetadata.forEach((metadata) => {
          const data = response[metadata.component.alias];
          const omitFields = ['assignees', 'labels', 'participants', 'timeline'];

          if (metadata.details.hasNextPage) {
            metadata.issue = { ...metadata.issue, ...omit(data, omitFields) };
            metadata.details.hasNextPage = false;
            metadata.issue.assignees = [];
            metadata.issue.labels = [];
            metadata.issue.participants = [];
            metadata.issue.timeline = [];
          }

          metadata.issue.assignees.push(...get(data, 'assignees.nodes', []));
          metadata.assignees.hasNextPage = get(data, 'assignees.page_info.has_next_page');
          metadata.assignees.endCursor = get(data, 'assignees.page_info.end_cursor');

          metadata.issue.labels.push(...get(data, 'labels.nodes', []));
          metadata.labels.hasNextPage = get(data, 'labels.page_info.has_next_page');
          metadata.labels.endCursor = get(data, 'labels.page_info.end_cursor');

          metadata.issue.participants.push(...get(data, 'participants.nodes', []));
          metadata.participants.hasNextPage = get(data, 'participants.page_info.has_next_page');
          metadata.participants.endCursor = get(data, 'participants.page_info.end_cursor');

          metadata.issue.timeline.push(...get(data, 'timeline.nodes', []));
          metadata.timeline.hasNextPage = get(data, 'timeline.page_info.has_next_page');
          metadata.timeline.endCursor = get(
            data,
            'timeline.page_info.end_cursor',
            metadata.timeline.endCursor
          );

          metadata.hasNextPage =
            metadata.assignees.hasNextPage ||
            metadata.labels.hasNextPage ||
            metadata.participants.hasNextPage ||
            metadata.timeline.hasNextPage;
        });

        this.pendingReactionsMetadata.forEach((metadata) => {
          const data = response[metadata.component.alias];
          metadata.reactions.push(...get(data, 'reactions.nodes', []));
          metadata.hasNextPage = get(data, 'reactions.page_info.has_next_page');
          metadata.endCursor = get(data, 'reactions.page_info.end_cursor');
        });

        if (!this.pendingIssuesMetadata.length && !this.reactionsMetadata) {
          const reactables = this.issuesMetadata
            .filter((meta) => meta.issue.reaction_groups)
            .map((meta) => ({ repository: this.repositoryId, issue: meta.issue.id }))
            .concat(
              this.issuesMetadata.reduce((timeseries, meta) => {
                return timeseries.concat(
                  meta.issue.timeline
                    .filter((event) => event.reaction_groups)
                    .map((event) => ({
                      repository: this.repositoryId,
                      issue: meta.issue.id,
                      event: event.id
                    }))
                );
              }, [])
            );

          this.reactionsMetadata = reactables.map((reactable, index) => ({
            reactable,
            component: new ReactionComponent(
              reactable.event || reactable.issue,
              `${this.alias}_reactable_${index}`
            ),
            reactions: [],
            hasNextPage: true,
            endCursor: null
          }));
        }

        if (!this.pendingIssuesMetadata.length && !this.pendingReactionsMetadata.length) {
          const issues = this.issuesMetadata.map((meta) =>
            compact(omit({ repository: this.component.id, ...meta.issue }, 'timeline'))
          );

          const timeline = this.issuesMetadata.reduce(
            (acc, meta) =>
              acc.concat(
                meta.issue.timeline.map((tl) =>
                  compact({
                    id: tl.id,
                    repository: this.component.id,
                    issue: meta.issue.id,
                    type: tl.type,
                    payload: omit(tl, ['id', 'type'])
                  })
                )
              ),
            []
          );

          const reactions = this.reactionsMetadata.reduce(
            (reactions, metadata) =>
              reactions.concat(
                metadata.reactions.map((reaction) => ({ ...metadata.reactable, ...reaction }))
              ),
            []
          );

          await Promise.all([
            this.dao[this.resource].insert(issues, trx),
            this.dao.timeline.insert(timeline, trx),
            this.dao.reactions.insert(reactions, trx),
            this.dao.metadata.upsert(
              [
                { ...this.meta, key: 'endCursor', value: this.issues.endCursor },
                { ...this.meta, key: 'updatedAt', value: new Date().toISOString() }
              ],
              trx
            )
          ]);

          this.issuesMetadata = null;
          this.reactionsMetadata = null;
        }
      }
    }
  }

  get pendingIssuesMetadata() {
    return (this.issuesMetadata || []).filter((meta) => meta.hasNextPage);
  }

  get pendingReactionsMetadata() {
    return (this.reactionsMetadata || []).filter((meta) => meta.hasNextPage);
  }

  get alias() {
    const alias = this.pendingIssuesMetadata.map((meta) => meta.component.alias);
    alias.push(super.alias);
    alias.push(...this.pendingReactionsMetadata.map((meta) => meta.component.alias));
    return alias;
  }

  get hasNextPage() {
    return (
      this.issues.hasNextPage ||
      this.pendingIssuesMetadata.length ||
      this.pendingReactionsMetadata.length
    );
  }
};
