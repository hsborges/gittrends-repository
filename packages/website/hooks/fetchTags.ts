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
  const { data, error } = useSWR(`/repos/${args.name_with_owner}/tags`, axios);

  return {
    tags: data?.data?.map((d: Record<string, any>) => ({
      ...d,
      committed_date: new Date(d.committed_date)
    })),
    error,
    isLoading: !data && !error,
    isError: !!error
  };
}
