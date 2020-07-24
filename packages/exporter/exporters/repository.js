/*
 *  Author: Hudson S. Borges
 */
const { omit, has, size } = require('lodash');

const exporter = require('./index');

module.exports = async ({ id, knex, mongo }) => {
  const updateMetadata = (repository, resource, updatedAt) =>
    knex('repository_metadata').insert({
      repository,
      resource,
      updated_at: updatedAt
    });

  // find repository
  const repo = await mongo.repositories.findOne(
    { _id: id },
    {
      projection: {
        _id: 1,
        code_of_conduct: 1,
        default_branch: 1,
        description: 1,
        license_info: 1,
        name: 1,
        name_with_owner: 1,
        open_graph_image_url: 1,
        owner: 1,
        primary_language: 1,
        disk_usage: 1,
        forks_count: 1,
        issues_count: 1,
        pull_requests_count: 1,
        releases_count: 1,
        stargazers_count: 1,
        vulnerability_alerts_count: 1,
        watchers_count: 1,
        created_at: 1,
        updated_at: 1,
        pushed_at: 1,
        languages: 1,
        repository_topics: 1,
        _meta: 1
      }
    }
  );

  if (repo && has(repo, '_meta.updated_at')) {
    // remove previous data
    await knex('repositories').where({ id }).delete();

    // insert user
    // await exporter.user({ id: repo.owner, knex, mongo });

    // insert repository
    await knex('repositories').insert(
      omit({ id: repo._id, ...repo }, ['_id', 'languages', 'repository_topics', '_meta'])
    );

    // insert programming languages
    if (repo.languages && size(repo.languages) > 0) {
      await knex('repository_languages').insert(
        repo.languages.map((d) => ({ repository: repo._id, ...d }))
      );
    }

    // insert repository topics
    if (repo.repository_topics && size(repo.repository_topics) > 0) {
      await knex('repository_topics').insert(
        repo.repository_topics.map((topic) => ({ repository: repo._id, topic }))
      );
    }

    // update metadata table
    await updateMetadata(repo._id, 'repo', repo._meta.updated_at);

    // insert other resources
    const promises = [];

    if (has(repo, '_meta.stargazers.updated_at'))
      promises.push(
        exporter
          .stargazers({ repository: repo._id, knex, mongo })
          .then(() => updateMetadata(repo._id, 'stargazers', repo._meta.stargazers.updated_at))
      );

    if (has(repo, '_meta.watchers.updated_at'))
      promises.push(
        exporter
          .watchers({ repository: repo._id, knex, mongo })
          .then(() => updateMetadata(repo._id, 'watchers', repo._meta.watchers.updated_at))
      );

    await Promise.all(promises);
  }
};
