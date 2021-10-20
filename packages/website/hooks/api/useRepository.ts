import { AxiosError } from 'axios';

import { Repository } from '@gittrends/website-api/database/types.d';

import { useFetch, FetchReturn } from '../useFetch';

type RepositoryId = { idOrOwner: string; name?: string };

export function useRepository(repo: RepositoryId): FetchReturn<Repository, AxiosError> {
  return useFetch<Repository, AxiosError>(
    `/repo/${repo.idOrOwner + (repo.name ? `/${repo.name}` : '')}`
  );
}
