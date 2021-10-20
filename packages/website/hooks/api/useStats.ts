import { AxiosError } from 'axios';

import { ResourceStat } from '@gittrends/website-api/database/types.d';

import { useFetch, FetchReturn } from '../useFetch';

export function useStats(): FetchReturn<ResourceStat[], AxiosError> {
  return useFetch<ResourceStat[], AxiosError>('/stats');
}
