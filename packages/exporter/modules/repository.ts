/*
 *  Author: Hudson S. Borges
 */
import actor from './actor';

import consola from 'consola';
import { join } from 'path';
import { Repository } from '@gittrends/database-config';

export default async function (name_with_owner: string) {
  const repo = await Repository.collection.findOne(
    { name_with_owner },
    {
      projection: {
        _id: 0,
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
        description: 1
      }
    }
  );

  if (!repo) throw new Error(`Repository "${name_with_owner}" not found!`);
  else repo.owner = await actor(repo.owner);

  return repo;
}
