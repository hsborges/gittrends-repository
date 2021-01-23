import useSWR from 'swr';
import axios from './axiosClient';

interface StargazersResult {
  timeseries?: Record<string, number>;
  first?: { user: string; starred_at: Date };
  last?: { user: string; starred_at: Date };
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

export default function FetchStargazers(args: { name_with_owner: string }): StargazersResult {
  const { data, error } = useSWR(`/repos/${args.name_with_owner}/stargazers`, axios);

  return {
    timeseries: data?.data.timeseries,
    first: data?.data.first && {
      ...data?.data.first,
      starred_at: new Date(data?.data.first.starred_at)
    },
    last: data?.data.last && {
      ...data?.data.last,
      starred_at: new Date(data?.data.last.starred_at)
    },
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
