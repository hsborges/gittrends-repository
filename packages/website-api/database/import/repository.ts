/*
 *  Author: Hudson S. Borges
 */
import { omit } from 'lodash';

import { RepositoryRepository } from '@gittrends/database-config';

import { Repository, RepositoryMetadata } from '../types';
import importActor from './actor';

export default async function (id: string): Promise<Repository | null> {
  const document = await RepositoryRepository.collection.findOne(
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
        repository_topics: 1,
        _metadata: 1
      }
    }
  );

  if (!document) return null;

  const repo = omit(document, '_metadata') as Repository;
  repo.owner = (await importActor(document.owner)) || undefined;
  repo.metadata = ['repository', 'tags', 'stargazers']
    .map((resource) => {
      if (!document._metadata[resource]) return;

      return {
        resource,
        updated_at: document._metadata[resource]?.updatedAt,
        end_cursor: document._metadata[resource]?.endCursor
      } as RepositoryMetadata;
    })
    .filter((meta) => !!meta) as RepositoryMetadata[];

  return repo;
}
