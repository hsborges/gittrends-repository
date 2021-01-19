import useSWR from 'swr';
import axios from 'axios';

interface SampleResult {
  data: Record<string, any>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

export interface ISearch {
  query?: string;
  language?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'random' | 'stargazers_count' | 'name_with_owner';
  order?: 'asc' | 'desc';
}

export default function FetchProjects(args?: ISearch): SampleResult {
  const queryString = [
    args?.query && `query=${args.query}`,
    args?.language && `language=${args.language}`,
    `limit=${args?.limit ?? 5}`,
    `offset=${args?.offset ?? 0}`,
    args?.sortBy && `sortBy=${args.sortBy}`,
    args?.order && `order=${args.order}`
  ]
    .filter((q) => q)
    .join('&');

  const { data, error } = useSWR(`http://127.0.0.1:8888/search/repos?${queryString}`, axios);

  return {
    data: data?.data,
    isLoading: !data && !error,
    isError: error,
    error: error
  };
}
