import { AxiosError } from 'axios';
import { isNil, negate, pickBy } from 'lodash';

import { BaseRepository } from '@gittrends/website-api/database/types.d';

import { useFetch, FetchReturn } from '../useFetch';

export type Search = {
  query?: string;
  language?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'stargazers_count' | 'name_with_owner';
  order?: 'asc' | 'desc';
};

export type RepositorySearchResult = {
  repos: BaseRepository[];
  meta: Search & { repositories_count: number; languages_count: Record<string, number> };
};

export function useSearch(search: Search): FetchReturn<RepositorySearchResult, AxiosError> {
  return useFetch<RepositorySearchResult, AxiosError>(
    '/repo/search',
    pickBy(search, negate(isNil))
  );
}
