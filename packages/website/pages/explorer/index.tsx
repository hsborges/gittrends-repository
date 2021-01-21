import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import pickBy from 'lodash/pickBy';
import isEqual from 'lodash/isEqual';
import DefaultLayout from '../../layouts/DefaultLayout';
import ServerError from '../../components/ServerError';
import Search from '../../components/Search';
import Card from '../../components/RepositoryCard';
import MadeWithLove from '../../components/MadeWithLove';
import fetchProjects, { ISearch } from '../../hooks/useSearch';
import { Select, Statistic, Empty, Skeleton, Pagination } from 'antd';

function Explorer(props: ISearch): JSX.Element {
  const container = React.createRef<HTMLElement>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(24);
  const [query, setQuery] = useState<ISearch>({ limit: pageSize, ...props });

  const { data, isLoading, isError } = fetchProjects(query);

  useEffect(() => {
    setQuery({ ...query, offset: (page - 1) * pageSize, limit: pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    Router.push({
      query: pickBy(query, (v) => v)
    });
  }, [query]);

  const updateQuery = (data, concat = false) => {
    if (isEqual({ ...query, ...data }, query)) return;
    setQuery({ ...query, offset: concat ? query.offset : 0, ...data });
  };

  return (
    <DefaultLayout className="gittrends-explorer-page">
      <header className="header">
        <Select
          className="select"
          placeholder="Programming language"
          defaultValue={query.language}
          allowClear
          onSelect={(value) => updateQuery({ language: value })}
          onClear={() => updateQuery({ language: undefined })}
        >
          {Object.entries(data?.meta.languages_count ?? {}).map((entry) => (
            <Select.Option
              key={entry[0]}
              value={entry[0]}
            >{`${entry[0]} (${entry[1]})`}</Select.Option>
          ))}
        </Select>
        <Skeleton loading={isLoading} title={false} paragraph={{ rows: 1 }} className="statistic">
          <Statistic title="Total Repositories" value={data?.meta.repositories_count} />
        </Skeleton>
        <Search
          className="search"
          defaultValue={query.query}
          onSearch={(value: string) => updateQuery({ query: value })}
        />
      </header>
      <section
        className="content"
        hidden={data?.meta.repositories_count === 0 || isLoading || isError}
        ref={container}
      >
        {data?.repositories.map((repo) => (
          <Card key={repo.id} repository={repo} className="card" />
        ))}
      </section>
      <section
        className="content"
        hidden={data?.meta.repositories_count > 0 || isLoading || isError}
      >
        <Empty style={{ fontSize: '1.5em' }} />
      </section>
      <section className="content" hidden={!isError}>
        <ServerError style={{ fontSize: '1.5em' }} />
      </section>
      <footer className="footer">
        <Pagination
          current={page}
          pageSize={pageSize ?? 24}
          hideOnSinglePage
          pageSizeOptions={['24', '48', '96']}
          responsive
          showLessItems
          total={data?.meta.repositories_count || 0}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
            container.current.scrollTo(0, 0);
          }}
        />
      </footer>
      <footer>
        <MadeWithLove />
      </footer>
    </DefaultLayout>
  );
}

Explorer.getInitialProps = ({ query }): ISearch => {
  return { query: query.query, language: query.language };
};

export default Explorer;
