import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import pickBy from 'lodash/pickBy';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import DefaultLayout from '../../layouts/DefaultLayout';
import ServerError from '../../components/ServerError';
import Search from '../../components/Search';
import Card from '../../components/RepositoryCard';
import fetchProjects, { ISearch } from '../../hooks/useSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { Button, Select, Statistic, Empty, Skeleton } from 'antd';

import './index.module.less';

function Explorer(props: ISearch): JSX.Element {
  const [query, setQuery] = useState<ISearch>({ limit: 24, ...props });
  const [repos, setRepos] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ languages_count?: number; repositories_count?: number }>({});

  const { data, isLoading, isError } = fetchProjects(query);

  useEffect(() => {
    setRepos(uniqBy([...repos, ...(data?.repositories ?? [])], 'id'));
    setMeta(data?.meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    Router.push({ query: pickBy(query, (v, k) => ['query', 'language'].indexOf(k) >= 0 && v) });
  }, [query]);

  const updateQuery = (data, concat = false) => {
    if (isEqual({ ...query, ...data }, query)) return;
    if (!concat) setRepos([]);
    setQuery({ ...query, offset: concat ? query.offset : 0, ...data });
  };

  return (
    <DefaultLayout className="explorer">
      <header className="header">
        <Select
          className="select"
          placeholder="Programming language"
          defaultValue={query.language}
          allowClear
          onSelect={(value) => updateQuery({ language: value })}
          onClear={() => updateQuery({ language: undefined })}
        >
          {Object.entries(meta?.languages_count ?? {}).map((entry) => (
            <Select.Option
              key={entry[0]}
              value={entry[0]}
            >{`${entry[0]} (${entry[1]})`}</Select.Option>
          ))}
        </Select>
        <Skeleton loading={isLoading} title={false} paragraph={{ rows: 1 }} className="statistic">
          <Statistic title="Total Repositories" value={meta?.repositories_count} />
        </Skeleton>
        <Search
          className="search"
          defaultValue={query.query}
          onSearch={(value: string) => updateQuery({ query: value })}
        />
      </header>
      <section className="content" hidden={meta?.repositories_count === 0 || isLoading || isError}>
        {repos.map((repo) => (
          <Card key={repo.id} repository={repo} className="card" />
        ))}
      </section>
      <section className="content" hidden={meta?.repositories_count > 0 || isLoading || isError}>
        <Empty style={{ fontSize: '1.5em' }} />
      </section>
      <section className="content" hidden={!isError}>
        <ServerError style={{ fontSize: '1.5em' }} />
      </section>
      <footer className="footer">
        <Button
          type="primary"
          size="large"
          icon={<FontAwesomeIcon icon={faSync} className="icon" />}
          loading={isLoading}
          onClick={() => updateQuery({ offset: (query?.offset ?? 0) + 24 }, true)}
          hidden={repos.length === meta?.repositories_count || isError}
        >
          Load more
        </Button>
      </footer>
    </DefaultLayout>
  );
}

Explorer.getInitialProps = ({ query }): ISearch => {
  return { query: query.query, language: query.language };
};

export default Explorer;
