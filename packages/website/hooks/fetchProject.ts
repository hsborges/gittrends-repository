import useSWR from 'swr';
import axios from './axiosClient';

interface FetchProjectResult {
  repository: Record<string, any>;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

export default function FetchProject(args: { name_with_owner: string }): FetchProjectResult {
  const { data, error } = useSWR(`/repos/${args.name_with_owner}`, axios);

  return {
    repository: data?.data,
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
