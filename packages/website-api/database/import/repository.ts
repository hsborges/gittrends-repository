/*
 *  Author: Hudson S. Borges
 */
import { omit } from 'lodash';

import { Repository as MongoRepository } from '@gittrends/database-config';

import importActor, { Actor } from './actor';

export type RepositoryMetadata = {
  resource: string;
  updated_at: Date;
  end_cursor: string;
};

export type Repository = {
  id: string;
  name: string;
  owner?: Actor;
  name_with_owner: string;
  homepage_url?: string;
  stargazers_count?: number;
  watchers_count?: number;
  forks_count?: number;
  primary_language?: string;
  default_branch?: string;
  code_of_conduct?: string;
  license_info?: string;
  issues_count?: number;
  pull_requests_count_count?: number;
  releases_count?: number;
  vulnerability_alerts_count?: number;
  created_at?: Date;
  updated_at?: Date;
  disk_usage?: number;
  open_graph_image_url?: string;
  description?: string;
  metadata: RepositoryMetadata[];
};

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
