import useSWR from 'swr';
import axios from './axiosClient';

interface FetchTagsResult {
  data: Record<string, number>;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

export default function FetchProjectTags(): FetchTagsResult {
  const { data, error } = useSWR(`/statistics`, axios);

  return {
    data: data?.data,
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
