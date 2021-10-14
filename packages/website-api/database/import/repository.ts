/*
 *  Author: Hudson S. Borges
 */
import { omit } from 'lodash';

import { Repository as MongoRepository } from '@gittrends/database-config';

import { Repository, RepositoryMetadata } from '../../models';
import actor from './actor';

export default async function (id: string): Promise<Repository | null> {
  const document = await MongoRepository.collection.findOne(
    { _id: id },
    {
      projection: {
        _id: 0,
        id: '$_id',
        name: 1,
        owner: 1,
        name_with_owner: 1,
        homepage_url: 1,
        stargazers_count: 1,
        watchers_count: 1,
        forks_count: 1,
        primary_language: 1,
        default_branch: 1,
        code_of_conduct: 1,
        license_info: 1,
        issues_count: 1,
        pull_requests_count_count: 1,
        releases_count: 1,
        vulnerability_alerts_count: 1,
        created_at: 1,
        updated_at: 1,
        disk_usage: 1,
        open_graph_image_url: 1,
        description: 1,
        _metadata: 1
      }
    }
  );

  if (!document) return null;

  const repo = new Repository(omit(document, '_metadata'));
  repo.owner = (await actor(document.owner)) || undefined;

  ['repository', 'tags', 'stargazers'].forEach((resource) => {
    if (!document._metadata[resource]) return;
    repo.metadata.add(
      new RepositoryMetadata({
        repository: repo,
        resource,
        updated_at: document._metadata[resource]?.updatedAt
      })
    );
  });

  return repo;
}
