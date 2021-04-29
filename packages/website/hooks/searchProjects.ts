import useSWR from 'swr';
import { countBy, sampleSize, sortBy } from 'lodash';
import axios from './axiosClient';
import { useEffect, useState } from 'react';

interface FetchProjectsResult {
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

interface IRepository {
  name_with_owner: string;
  primary_language: string;
  stargazers_count: number;
}

export default function FetchProjects(args?: ISearch): FetchProjectsResult {
  const { data, error } = useSWR('/repos.json', (url) =>
    axios.get(url).then(
      (result): Array<IRepository> => {
        return result.data.map((d: any) => {
          const [name_with_owner, primary_language, stargazers_count] = d;
          return { name_with_owner, primary_language, stargazers_count };
        });
      }
    )
  );

  const [response, setResponse] = useState<{
    repositories: Array<IRepository>;
    meta: { repositories_count: number; languages_count: Record<string, number> };
  }>();

  useEffect(() => {
    if (!data) return;
    let repositories = data;

    if (args?.query)
      repositories = repositories.filter(
        (repo) => repo.name_with_owner.toLowerCase().indexOf(args.query.toLowerCase()) >= 0
      );

    if (args?.language)
      repositories = repositories.filter((repo) => repo.primary_language === args?.language);

    const repositoriesCount = repositories.length;
    const languagesCount = countBy(repositories, 'primary_language');

    if (args?.sortBy === 'stargazers_count')
      repositories = sortBy(repositories, 'stargazers_count', args?.order ?? 'desc');

    if (args?.sortBy === 'name_with_owner')
      repositories = sortBy(repositories, 'name_with_owner', args?.order ?? 'asc');

    if (args?.sortBy === 'random') repositories = sampleSize(repositories, args?.limit);

    repositories = repositories.slice(args?.offset ?? 0, (args?.offset ?? 0) + (args?.limit ?? 5));

    setResponse({
      repositories,
      meta: { repositories_count: repositoriesCount, languages_count: languagesCount }
    });

    console.log(args, {
      repositories,
      meta: { repositories_count: repositoriesCount, languages_count: languagesCount }
    });
  }, [data, args.query, args.language, args.limit, args.offset, args.order, args.sortBy]);

  return {
    data: response,
    isLoading: !data && !error,
    isError: error,
    error: error
  };
}
