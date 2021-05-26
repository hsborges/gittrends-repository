import useSWR from 'swr';
import axios from './axiosClient';

type Tag = {
  id: string;
  name: string;
  committed_date: Date;
  additions?: number;
  changed_files?: number;
  deletions?: number;
};

interface FetchTagsResult {
  tags: Array<Tag>;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

export default function FetchProjectTags(args: { name_with_owner: string }): FetchTagsResult {
  const fetcher = (url) =>
    axios.get(url).then((result) =>
      result.data.map(([name, committed_date, additions, deletions, changed_files]) => {
        return { name, committed_date, additions, deletions, changed_files };
      })
    );

  const { data, error } = useSWR(`/${args.name_with_owner}/tags.json`, fetcher);

  return {
    tags: data,
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
