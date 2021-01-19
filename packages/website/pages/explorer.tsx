import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import pickBy from 'lodash/pickBy';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import DefaultLayout from '../layouts/DefaultLayout';
import Search from '../components/Search';
import Card from '../components/RepositoryCard';
import fetchProjects, { ISearch } from '../hooks/useSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { Affix, Button, Layout, Select, Statistic, Empty } from 'antd';
const { Header, Content } = Layout;

import './explorer.module.less';
import { Footer } from 'antd/lib/layout/layout';

function Explorer(props: ISearch): JSX.Element {
  const [query, setQuery] = useState<ISearch>({ limit: 24, ...props });
  const [repos, setRepos] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ languages_count?: number; repositories_count?: number }>({});

  const { data, isLoading } = fetchProjects(query);

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
    <DefaultLayout>
      <Layout className="explorer">
        <Affix target={() => window}>
          <Header className="header">
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
            <Statistic title="Total Repositories" value={meta?.repositories_count} />
            <Search
              className="search"
              defaultValue={query.query}
              onSearch={(value: string) => updateQuery({ query: value })}
            />
          </Header>
        </Affix>
        <Content className="content">
          {meta?.repositories_count > 0 ? (
            repos.map((repo) => <Card key={repo.id} repository={repo} />)
          ) : (
            <Empty style={{ fontSize: '1.5em' }} />
          )}
        </Content>
        <Footer className="footer">
          <Button
            type="primary"
            size="large"
            icon={<FontAwesomeIcon icon={faSync} className="icon" />}
            loading={isLoading}
            onClick={() => updateQuery({ offset: (query?.offset ?? 0) + 24 }, true)}
            hidden={repos.length === meta?.repositories_count}
          >
            Load more
          </Button>
        </Footer>
      </Layout>
    </DefaultLayout>
  );
}

Explorer.getInitialProps = ({ query }): ISearch => {
  return { query: query.query, language: query.language };
};

export default Explorer;
