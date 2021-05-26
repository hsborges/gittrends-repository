import useSWR from 'swr';
import axios from './axiosClient';

interface FetchActorResult {
  repository: Record<string, any>;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

export default function FetchProject(args: { name_with_owner: string }): FetchActorResult {
  const { data, error } = useSWR(`/${args.name_with_owner}/repo.json`, axios);

  return {
    repository: data?.data,
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
