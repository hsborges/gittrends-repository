import { AxiosError } from 'axios';

import { Stargazer, StargazerTimeseries } from '@gittrends/website-api/database/types.d';

import { useFetch, FetchReturn } from '../useFetch';

type RepositoryId = { idOrOwner: string; name?: string };

export type StargazerTimeseriesResult = {
  timeseries: StargazerTimeseries[];
  first: Stargazer;
  last: Stargazer;
};

export function useStargazerTimeseries(
  repo: RepositoryId
): FetchReturn<StargazerTimeseriesResult, AxiosError> {
  return useFetch<StargazerTimeseriesResult, AxiosError>(
    `/repo/${repo.idOrOwner + (repo.name ? `/${repo.name}` : '')}/stargazers`
  );
}
