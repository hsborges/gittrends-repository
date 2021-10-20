import axios from 'axios';
import useSWR from 'swr';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GITTRENDS_WEBSITE_DATASOURCE_URL
});

export type FetchReturn<T = any, E = any> = {
  data?: T;
  error?: E;
  isLoading: boolean;
  isError: boolean;
};

export function useFetch<Data = any, Error = any>(
  url: string,
  params?: Record<string, any>
): FetchReturn<Data, Error> {
  const { data, error } = useSWR<Data, Error>(
    `${url}?${new URLSearchParams(params)}`,
    async (url) => api.get(url).then(({ data }) => data)
  );

  return { data, error, isLoading: !data && !error, isError: !!error };
}
