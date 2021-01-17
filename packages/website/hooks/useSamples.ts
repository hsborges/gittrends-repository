import useSWR from 'swr';
import axios from 'axios';

interface SampleResult {
  samples: Record<string, any>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

export default function FetchSamples(count?: number): SampleResult {
  const { data, error } = useSWR(
    `http://127.0.0.1:8888/search/repos?random&limit=${count ?? 5}`,
    axios
  );

  return {
    samples: data?.data,
    isLoading: !data && !error,
    isError: error,
    error: error
  };
}
