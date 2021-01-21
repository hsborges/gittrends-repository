import useSWR from 'swr';
import axios from 'axios';

interface RepositoryArguments {
  name_with_owner: string;
}

interface RepositoryResult {
  repository: Record<string, any>;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

export default function FetchStargazersTimeseries(args: RepositoryArguments): RepositoryResult {
  const { data, error } = useSWR(`http://127.0.0.1:8888/repos/${args.name_with_owner}`, axios);

  return {
    repository: data?.data,
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
